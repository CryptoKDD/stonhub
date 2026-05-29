import { NextResponse } from 'next/server';

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stonhub.vercel.app';

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: object) {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in env variables');
    return false;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Error sending message to Telegram:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Fetch error when calling Telegram API:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is missing' }, { status: 500 });
    }

    const body = (await request.json()) as TelegramUpdate;
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || 'Пользователь';

    // === /start Command ===
    if (text.startsWith('/start')) {
      const welcomeMessage = `🚀 <b>STONHub — Премиальный кросс-чейн портал</b>\n\n` +
        `Приветствуем тебя, <b>${firstName}</b>!\n\n` +
        `<b>STONHub</b> — это высокотехнологичный Web3-портал для мгновенных обменов активов между сетями <b>TON, Base и Polygon</b> без сложных ручных мостов.\n\n` +
        `🤖 <b>Твой ИИ-Штурман Mira:</b>\n` +
        `Внутри приложения тебя ждет умный помощник Mira. Просто напиши ей: <i>"Хочу обменять 10 TON на USDC на Base"</i>, и она мгновенно подготовит для тебя сделку через протокол Omniston.\n\n` +
        `💎 <b>Особенности:</b>\n` +
        `• Сверхреалистичный интерфейс «Жидкого стекла».\n` +
        `• Прямая работа с кошельками TonConnect и RainbowKit.\n` +
        `• Поддержка котировок RFQ в реальном времени.\n\n` +
        `Нажмите на кнопку ниже, чтобы запустить приложение и начать премиальные кросс-чейн свопы! 👇`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🚀',
              web_app: {
                url: APP_URL,
              },
            },
          ],
          [
            {
              text: 'Официальный канал STON Hub 📢',
              url: 'https://t.me/stonhubapp',
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, welcomeMessage, inlineKeyboard);
    } 
    // === /help Command ===
    else if (text === '/help') {
      const helpMessage = `❓ <b>Как это работает?</b>\n\n` +
        `1. Нажмите кнопку <b>Открыть STON Hub 🚀</b> под этим сообщением.\n` +
        `2. Подключите свои кошельки: TON (через TonConnect) и EVM (через RainbowKit) в шапке приложения.\n` +
        `3. В разделе <b>«Co-Pilot (ИИ Чат)»</b> напишите штурману Mira, что вы хотите обменять, или кликните по быстрым подсказкам.\n` +
        `4. Для классического обмена перейдите во вкладку <b>«Pro Своп»</b>.\n` +
        `5. Подпишите сделку прямо из своего кошелька, а наша релей-сеть Cocoon выполнит безопасную доставку активов.\n\n` +
        `Присоединяйтесь к нашему каналу, чтобы следить за развитием кросс-чейн технологий!`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🚀',
              web_app: {
                url: APP_URL,
              },
            },
          ],
          [
            {
              text: 'Официальный канал STON Hub 📢',
              url: 'https://t.me/stonhubapp',
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, helpMessage, inlineKeyboard);
    } 
    // === Any other fallback text ===
    else {
      const defaultMessage = `Я получил ваше сообщение! Все кросс-чейн свопы и общение с ИИ-штурманом Mira происходят внутри нашего премиального приложения. 😉\n\n` +
        `Нажмите на кнопку ниже, чтобы открыть хаб:`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🚀',
              web_app: {
                url: APP_URL,
              },
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, defaultMessage, inlineKeyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling webhook update:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
