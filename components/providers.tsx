'use client';

import React, { useEffect, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Инициализируем стандартный Telegram WebApp API на клиенте
    if (typeof window !== 'undefined') {
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
      <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-t-2 border-[#00D2FF] animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">STON Vibe Studio...</p>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
