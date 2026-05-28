'use client';

import React, { useEffect, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [manifestUrl, setManifestUrl] = useState('https://stonhub.vercel.app/tonconnect-manifest.json');
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  useEffect(() => {
    setMounted(true);
    
    // Инициализируем стандартный Telegram WebApp API на клиенте
    if (typeof window !== 'undefined') {
      setManifestUrl(`${window.location.origin}/tonconnect-manifest.json`);
      
      // Load saved language preference
      const saved = localStorage.getItem('stonhub_lang');
      if (saved === 'ru' || saved === 'en') {
        setLang(saved as 'ru' | 'en');
      } else {
        const isBrowserRu = window.navigator.language.startsWith('ru');
        setLang(isBrowserRu ? 'ru' : 'en');
      }

      const tg = (window as unknown as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          console.log('Telegram WebApp initialized & expanded successfully');
        } catch (err) {
          console.warn('Failed to call Telegram WebApp ready/expand:', err);
        }
      }
    }
  }, []);


  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 relative overflow-hidden font-sans">
        {/* Ambient warm background glow */}
        <div className="absolute w-64 h-64 bg-[#FF9900]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Premium Spinner and Pulsing Logo */}
        <div className="relative flex items-center justify-center">
          {/* Glowing outer spin circle */}
          <div className="w-20 h-20 rounded-full border border-white/5 border-t-2 border-t-[#FF9900] animate-spin shadow-[0_0_20px_rgba(255,153,0,0.15)]" />
          
          {/* Pulsing Central Logo */}
          <div className="absolute w-14 h-14 rounded-full overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="STONHub" className="w-full h-full object-cover scale-[1.05]" />
          </div>
        </div>

        {/* Premium Branding Stack */}
        <div className="text-center space-y-1.5 z-10">
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl font-black tracking-tighter text-white">STON</span>
            <span className="bg-[#FF9900] text-black text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">HUB</span>
          </div>
          <p className="text-[9px] tracking-wider text-neutral-500 uppercase font-black animate-pulse">
            {lang === 'ru' ? 'твой хаб в экосистеме STON.fi' : 'your hub in the STON.fi ecosystem'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
