/**
 * STON Vibe Studio - Local Bot Simulator (Long Polling)
 * 
 * Этот скрипт позволяет запускать и тестировать Telegram-бота локально на вашем компьютере
 * без необходимости настраивать Webhooks или Vercel. Он автоматически опрашивает API
 * Telegram с помощью метода getUpdates.
 * 
 * Запуск:
 * 1. Задайте переменную окружения TELEGRAM_BOT_TOKEN
 * 2. Выполните: node scripts/bot-local.js
 */

const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stonhub.vercel.app';

if (!BOT_TOKEN) {
  console.error('\x1b[31m%s\x1b[0m', 'Ошибка: Переменная окружения TELEGRAM_BOT_TOKEN не задана!');
  console.error('\x1b[33m%s\x1b[0m', 'Пожалуйста, установите её перед запуском:');
  console.error('На Windows (PowerShell): $env:TELEGRAM_BOT_TOKEN="ваш_токен_бота"');
  console.error('На macOS/Linux: export TELEGRAM_BOT_TOKEN="ваш_токен_бота"');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'STON Vibe Studio Bot Simulator запущен...');
console.log(`URL Приложения: ${APP_URL}`);
console.log('Ожидание сообщений от Telegram (Long Polling)... Прервать: Ctrl+C\n');

let lastUpdateId = 0;

// Функция отправки POST запросов к API Telegram
function callTelegramAPI(method, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 448,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Главная логика обработки сообщений
async function handleMessage(message) {
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();
  const firstName = message.from?.first_name || 'Амбассадор';
  const username = message.from?.username ? `@${message.from.username}` : 'без юзернейма';

  console.log(`[Сообщение] От: ${firstName} (${username}) | Текст: "${text}"`);

  // Обработка /start
  if (text.startsWith('/start')) {
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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } 
  // Обработка /help
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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: helpMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } 
  // Любое другое сообщение
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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: defaultMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  }
}

// Функция длинного опроса Telegram (Long Polling)
async function pollUpdates() {
  try {
    const payload = {
      timeout: 30,
      offset: lastUpdateId + 1
    };
    
    const response = await callTelegramAPI('getUpdates', payload);
    
    if (response.ok && response.result.length > 0) {
      for (const update of response.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          try {
            await handleMessage(update.message);
          } catch (err) {
            console.error('Ошибка при обработке сообщения:', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Ошибка во время опроса Telegram API (getUpdates):', error.message || error);
    // Ждем 5 секунд перед повторной попыткой при ошибке сети
    await new Promise(r => setTimeout(r, 5000));
  }
  
  // Рекурсивный вызов для непрерывного опроса
  setTimeout(pollUpdates, 100);
}

// Запуск опроса
pollUpdates();
