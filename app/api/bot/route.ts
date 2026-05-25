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

      const welcomeMessage = `🚀 <b>Добро пожаловать в STONHUB, ${firstName}!</b>\n\n` +
        `Мы рады видеть вас в премиальной геймифицированной Web3-экосистеме для амбассадоров <b>STON.fi</b>.\n\n` +
        `💎 <b>Наши ключевые возможности:</b>\n\n` +
        `🎓 <b>Академия (Onboarding)</b>\n` +
        `Интерактивное обучение в формате квестов с тестами. Изучите основы DEX, стейкинга и откройте доступ к наградам!\n\n` +
        `👤 <b>Профиль Амбассадора</b>\n` +
        `Ваш личный кабинет с TON-кошельком, вашим рейтингом в системе и первыми welcome-бонусами.\n\n` +
        `🛠 <b>Bounty-board (Задания)</b>\n` +
        `Выполняйте социальные задания (Twitter, переводы, посты) с ИИ-контролем качества и соревнуйтесь в ТОП-3 за неделю.\n\n` +
        `📈 <b>Utility-инструменты</b>\n` +
        `Следите за курсом $STON/$TON в реальном времени и совершайте быстрые обмены через Fast Swap на базе STON.fi API.\n\n` +
        `🎰 <b>Retention (Лотереи & Стейкинг)</b>\n` +
        `Участвуйте в еженедельных лотереях и управляйте своими позициями стейкинга.${refText}\n\n` +
        `Нажмите на кнопку ниже, чтобы запустить приложение и активировать свой профиль! 👇`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STONHUB 🚀',
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
      const helpMessage = `❓ <b>Как это работает?</b>\n\n` +
        `1. Нажмите кнопку <b>Открыть STON Vibe Studio</b>.\n` +
        `2. Подключите свой TON-кошелек (например, Tonkeeper).\n` +
        `3. Выполняйте ежедневные задания и тесты в Академии.\n` +
        `4. Получайте Вайб-Очки (XP) и повышайте свой ранг амбассадора.\n\n` +
        `Если у вас возникли вопросы, обратитесь в нашу службу поддержки или посетите официальный чат!`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Запустить Приложение 🚀',
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
      const defaultMessage = `Я получил ваше сообщение! Но лучше всего использовать интерактивные функции внутри нашего Mini App.\n\n` +
        `Нажмите на кнопку ниже, чтобы открыть студию:`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: 'Открыть STONHUB 🚀',
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
