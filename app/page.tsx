'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight as SwapIcon, 
  Send as SendIcon, 
  Wallet as WalletIcon, 
  Settings, 
  ChevronDown, 
  Info, 
  Shield, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  Zap, 
  Clock, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  MessageSquare,
  Globe, 
  Languages, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import {
  useRfq,
  useOmniston,
  type AssetId,
  type QuoteRequest,
  type ChainAddress
} from '@ston-fi/omniston-sdk-react';
import { useAccount, useSignTypedData } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// === Dynamic Premium Token Logos ===
const TokenLogo = ({ symbol, className = "w-5 h-5 rounded-full shrink-0" }: { symbol: string; className?: string }) => {
  const symbolUpper = symbol.toUpperCase();
  let logoUrl = '';
  
  if (symbolUpper === 'TON') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/TON/logo.png';
  } else if (symbolUpper === 'USDT' || symbolUpper === 'USD₮') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/USD%E2%82%AE/logo.png';
  } else if (symbolUpper === 'STON') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/STON/logo.png';
  } else if (symbolUpper === 'ETH') {
    logoUrl = 'https://images.weserv.nl/?url=https%3A%2F%2Fassets.coingecko.com%2Fcoins%2Fimages%2F279%2Flarge%2Fethereum.png&w=48&h=48';
  } else if (symbolUpper === 'USDC') {
    logoUrl = 'https://images.weserv.nl/?url=https%3A%2F%2Fassets.coingecko.com%2Fcoins%2Fimages%2F6319%2Flarge%2FUSD_Coin_icon.png&w=48&h=48';
  } else if (symbolUpper === 'POL') {
    logoUrl = 'https://images.weserv.nl/?url=https%3A%2F%2Fassets.coingecko.com%2Fcoins%2Fimages%2F31448%2Flarge%2Fpol.png&w=48&h=48';
  }

  const proxiedUrl = logoUrl 
    ? `https://images.weserv.nl/?url=${encodeURIComponent(logoUrl)}&w=48&h=48&fit=cover`
    : `https://images.weserv.nl/?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftonkeeper%2Fton-assets%2Fmain%2Fbranding%2Ftonkeeper%2Flogo_128x128.png&w=48&h=48&fit=cover`;

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden shrink-0 bg-neutral-900 border border-white/10 rounded-full`}>
      <img 
        src={proxiedUrl} 
        alt={symbol} 
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/branding/tonkeeper/logo_128x128.png';
        }}
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
    { symbol: 'STON', name: 'STON.fi', priceUsd: 3.38 }
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
    tabCoPilot: 'Co-Pilot (ИИ Чат)',
    tabProSwap: 'Pro Своп',
    walletConnected: 'Подключен',
    walletConnectTon: 'TON Кошелек',
    walletConnectEvm: 'EVM Кошелек',
    connectPrompt: 'Подключите кошельки в шапке',
    
    // Onboarding
    welcomeTitle: 'Добро пожаловать в STONHub!',
    welcomeDesc: 'Твой премиальный хаб для кросс-чейн обменов нового поколения. Пройдём короткий тур со штурманом!',
    onboardingStep1: 'Привет! Я Mira, твой ИИ-штурман по кросс-чейну в STONHub. Моя цель — сделать обмены между блокчейнами максимально простыми. 💎',
    onboardingStep2: 'Здесь больше нет сложных мостов! Мы используем передовую технологию Omniston. Вы можете менять TON на USDC на Base за пару кликов прямо в диалоге.',
    onboardingStep3: 'Подключи свой TON-кошелек и EVM-кошелек вверху страницы. Вы можете писать мне запросы вроде "Хочу обменять 10 TON на USDC на Base", и я подготовлю сделку!',
    onboardingStartBtn: 'Начать обмены 🚀',
    next: 'Далее',
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
    
    successMsg: 'Обмен успешно завершен! 🎉',
    errorMsg: 'Произошла ошибка при обмене. Попробуйте еще раз. ❌'
  },
  en: {
    appName: 'STONHub',
    appSubName: 'CROSS-CHAIN PORTAL',
    letsGo: 'LET\'S GO! 🚀',
    loading: 'Loading premium environment...',
    tabCoPilot: 'Co-Pilot (AI Chat)',
    tabProSwap: 'Pro Swap',
    walletConnected: 'Connected',
    walletConnectTon: 'TON Wallet',
    walletConnectEvm: 'EVM Wallet',
    connectPrompt: 'Connect wallets in header',
    
    // Onboarding
    welcomeTitle: 'Welcome to STONHub!',
    welcomeDesc: 'Your premium hub for next-generation cross-chain swaps. Let\'s take a quick tour with our co-pilot!',
    onboardingStep1: 'Hi! I\'m Mira, your AI co-pilot for cross-chain in STONHub. My goal is to make multi-chain swaps as frictionless as possible. 💎',
    onboardingStep2: 'No more complicated bridges! We use state-of-the-art Omniston technology. Swap TON directly to USDC on Base in a few clicks right here in our chat.',
    onboardingStep3: 'Connect your TON wallet and EVM wallet in the header. Write prompts like "Swap 10 TON to USDC on Base" and I\'ll instantly setup the widget for you!',
    onboardingStartBtn: 'Start Swapping 🚀',
    next: 'Next',
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
    
    successMsg: 'Swap completed successfully! 🎉',
    errorMsg: 'Transaction failed. Please try again. ❌'
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
        const step = Math.floor(Math.random() * 8) + 4;
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
  const [activeTab, setActiveTab] = useState<'copilot' | 'pro'>('copilot');

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
    
    // Open transaction stepper directly
    triggerTxWorkflow();
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

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Background Soft Gradients (Premium non-neon aesthetic) */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#FF9900]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF5500]/1 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#FF9900]/1 blur-[120px] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. STARTING SPLASH SCREEN (GLUSHER) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="fixed inset-0 bg-[#060608] z-50 flex flex-col items-center justify-center p-6"
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
          >
            <div className="w-full max-w-sm flex flex-col items-center justify-center text-center space-y-8">
              
              {/* Spinning Premium Rings */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/5 border-t-2 border-t-[#FF9900] animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute w-20 h-20 rounded-full border border-white/5 border-r-2 border-r-[#FF5500] animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
                <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,153,0,0.15)] z-10 glossy-reflection">
                  <span className="text-xl font-black text-[#FF9900]">SH</span>
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
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-sm tracking-wider shadow-[0_4px_25px_rgba(255,153,0,0.3)] hover:shadow-[0_4px_30px_rgba(255,153,0,0.45)] transition-all cursor-pointer select-none"
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
      {/* 2. WELCOME ONBOARDING DIALOGUE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md liquid-glass-card rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] to-[#FF5500]" />
              
              {/* AI Co-Pilot Mascot Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FF5500] flex items-center justify-center shadow-lg relative shrink-0">
                  <span className="text-xl font-bold text-black">M</span>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#060608]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    Mira <span className="bg-white/10 text-neutral-300 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide">CO-PILOT</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">STONHub Cross-chain Assistant</p>
                </div>
              </div>

              {/* Steps Progress dots */}
              <div className="flex items-center gap-1 mb-4">
                {[0, 1, 2].map((idx) => (
                  <div 
                    key={idx} 
                    className={`h-[3px] rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-6 bg-[#FF9900]' : 'w-2 bg-neutral-800'}`}
                  />
                ))}
              </div>

              {/* Chat Bubble Step Content */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 min-h-[120px] flex flex-col justify-center mb-6 relative">
                <p className="text-sm font-medium leading-relaxed text-neutral-200">
                  {onboardingStep === 0 && t.onboardingStep1}
                  {onboardingStep === 1 && t.onboardingStep2}
                  {onboardingStep === 2 && t.onboardingStep3}
                </p>
              </div>

              {/* Onboarding buttons */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={completeOnboarding}
                  className="text-xs text-neutral-500 hover:text-white font-black tracking-wide"
                >
                  {t.skip}
                </button>
                
                {onboardingStep < 2 ? (
                  <button
                    onClick={() => setOnboardingStep((p) => p + 1)}
                    className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black tracking-wide transition-all"
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs tracking-wider shadow-lg"
                  >
                    {t.onboardingStartBtn}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. APP HEADER (CONNECT BUTTONS & TABS) */}
      {/* ========================================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2 z-10 relative">
        <div className="flex items-center justify-between gap-4 mb-6">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('copilot')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FF5500] flex items-center justify-center shadow-lg relative">
              <span className="text-sm font-black text-black">S</span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#060608]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tighter text-white">STONHub</span>
              <span className="text-[8px] tracking-[0.18em] text-[#8C8C96] font-bold uppercase">{t.appSubName}</span>
            </div>
          </div>

          {/* Action Header Items */}
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

        {/* ========================================================================= */}
        {/* PREMIUM TABS BAR */}
        {/* ========================================================================= */}
        <div className="w-full max-w-sm mx-auto mb-4 bg-black/40 border border-white/5 p-1 rounded-xl flex">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'copilot' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {t.tabCoPilot}
          </button>
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'pro' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
          >
            <SwapIcon className="w-3.5 h-3.5" />
            {t.tabProSwap}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT TABS WITH ANIMATIONS */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-24 z-10 relative flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CO-PILOT AI CHAT */}
          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-xl flex flex-col h-[65vh] liquid-glass-card rounded-2xl overflow-hidden"
            >
              
              {/* Chat Header banner */}
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

              {/* Chat History Flow */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-neutral-950/20">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    
                    {/* Chat Bubble */}
                    <div 
                      className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#FF9900]/20 to-[#FF5500]/10 border border-[#FF9900]/20 text-white' : 'bg-white/5 border border-white/5 text-neutral-200'}`}
                    >
                      {msg.text}
                    </div>

                    {/* Inline active widget if returned by Co-Pilot */}
                    {msg.widgetData && (
                      <div className="w-full max-w-sm mt-3 liquid-glass-card border border-[#FF9900]/20 rounded-xl p-4 space-y-3 bg-black/40">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black text-neutral-400 tracking-wider uppercase">{t.aiWidgetTitle}</span>
                          <span className="text-[10px] font-black text-[#FF9900] bg-[#FF9900]/10 px-1.5 py-0.5 rounded">LIVE RFQ</span>
                        </div>

                        {/* Route mapping */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black">{msg.widgetData.srcToken}</span>
                            <span className="text-[10px] text-neutral-500">({msg.widgetData.srcChain.toUpperCase()})</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-600 animate-pulse" />
                          <div className="flex items-center gap-1 text-right">
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
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          {t.swapBtnActive}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing status indicator */}
                {isAiTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 max-w-[120px]">
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggesters */}
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

              {/* Chat Input panel */}
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

          {/* TAB 2: PRO SWAP WIDGET */}
          {activeTab === 'pro' && (
            <motion.div
              key="pro"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
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

              {/* Centered Swapper Switcher Button */}
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

              {/* RFQ Quote Details Box */}
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

              {/* Main Submit Action */}
              <button
                onClick={triggerTxWorkflow}
                disabled={!tonAddress || !evmAddress || !srcAmount}
                className={`w-full py-4 rounded-xl font-black text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${(!tonAddress || !evmAddress) ? 'bg-white/5 border border-white/5 text-neutral-500 cursor-not-allowed' : !srcAmount ? 'bg-white/10 text-neutral-300' : 'bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black shadow-[0_4px_20px_rgba(255,153,0,0.2)] hover:scale-[1.01]'}`}
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
              
              {/* Stepper Header */}
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{t.swappingProgress}</h4>
                <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Powered by Cocoon Relayer</p>
              </div>

              {/* Active Loading Ring */}
              {txSuccess === null && (
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-2 border-t-[#FF9900] animate-spin" />
                  <TokenLogo symbol={srcToken} className="w-12 h-12" />
                </div>
              )}

              {/* Success Checkmark */}
              {txSuccess === true && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
              )}

              {/* Step checklist blocks */}
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

              {/* Complete Action Button */}
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

    </div>
  );
}
