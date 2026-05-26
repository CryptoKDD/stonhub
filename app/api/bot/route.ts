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
// URL нашего Web App (будет браться из переменных окружения Vercel или дефолтное значение)
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
    const firstName = message.from?.first_name || 'Амбассадор';

    // Обработка команды /start
    if (text.startsWith('/start')) {
      // Проверяем реферальный код в параметрах (например, /start ref_350)
      const parts = text.split(' ');
      const refParam = parts.length > 1 ? parts[1] : null;
      let refText = '';
      
      if (refParam && refParam.startsWith('ref_')) {
        const referrerId = refParam.replace('ref_', '');
        refText = `\n\n<i>Ваш пригласитель: Амбассадор #${referrerId} 🤝</i>`;
      }

      const welcomeMessage = `🗿🟠 <b>STON Hub — Премиальный амбассадорский хаб!</b>\n\n` +
        `Приветствуем вас, <b>${firstName}</b>!\n\n` +
        `Мы рады видеть вас в <b>STON Hub</b> — геймифицированной Web3-экосистеме для лучших амбассадоров <b>STON.fi</b>. 🔥\n\n` +
        `💎 <b>Наши горячие разделы:</b>\n\n` +
        `🎓 <b>Академия STON Hub (Academy)</b>\n` +
        `Интерактивные текстовые гайды и курсы! Читайте полезные материалы, проходите тесты и зарабатывайте XP.\n\n` +
        `👤 <b>Профиль & Лидерборд</b>\n` +
        `Личный кабинет амбассадора: баланс $STON, TON-кошелек, ачивки и глобальный подиум лидеров.\n\n` +
        `🎯 <b>Миссии (Quests)</b>\n` +
        `Ежедневные квесты и bounty-задания (подписки, посты) с мгновенной проверкой опыта.\n\n` +
        `<i>STON IS LOVE. STON IS LIFE. 🗿🔥</i>${refText}\n\n` +
        `Нажмите на кнопку ниже, чтобы запустить приложение и активировать свой профиль! 👇`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🗿🟠',
              web_app: {
                url: APP_URL,
              },
            },
          ],
          [
            {
              text: 'Официальный канал STON.fi 📢',
              url: 'https://t.me/stonfidex',
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, welcomeMessage, inlineKeyboard);
    } 
    // Обработка команды /help
    else if (text === '/help') {
      const helpMessage = `❓ <b>Как устроен STON Hub?</b>\n\n` +
        `1. Нажмите кнопку <b>Открыть STON Hub 🗿🟠</b>.\n` +
        `2. Подключите свой TON-кошелек (например, Tonkeeper).\n` +
        `3. Зайдите в раздел <b>«Академия»</b>, читайте гайды и сдавайте тесты.\n` +
        `4. Выполняйте ежедневные квесты в разделе <b>«Миссии»</b>.\n` +
        `5. Получайте XP и поднимайтесь на подиум лучших в <b>«Профиле»</b>!\n\n` +
        `<i>STON IS LOVE. STON IS LIFE. 🗿🔥</i>`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🗿🟠',
              web_app: {
                url: APP_URL,
              },
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, helpMessage, inlineKeyboard);
    } 
    // Обработка любого другого сообщения
    else {
      const defaultMessage = `Я получил ваше сообщение! Но горячие видео, квесты и обмены токенов ждут вас внутри нашего приложения. 😉\n\n` +
        `Нажмите на кнопку ниже, чтобы открыть хаб:`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STON Hub 🗿🟠',
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
