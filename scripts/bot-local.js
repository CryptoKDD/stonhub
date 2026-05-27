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
      refText = `\n\n<i>Твой наставник: Игрок #${referrerId} 🤝</i>`;
    }

    const welcomeMessage = `🗿🟠 <b>STON Hub — Твой интерактивный игровой портал в STON.fi!</b>\n\n` +
      `Приветствуем тебя, <b>${firstName}</b>!\n\n` +
      `Добро пожаловать в <b>STON Hub</b> — геймифицированную Web3-вселенную ведущей децентрализованной биржи <b>STON.fi</b>. Исследуй разделы, выполняй миссии, прокачивай уровень и доминируй в рейтинге! 🎮🔥\n\n` +
      `💎 <b>Твои игровые зоны:</b>\n\n` +
      `🎬 <b>Видео Академия (DeFi Videos)</b>\n` +
      `Обучающие видеоролики в стиле любимого «Хаба»! Смотри горячие лекции, сдавай тесты и зарабатывай XP.\n\n` +
      `👤 <b>Профиль & Лидерборд (Player Center)</b>\n` +
      `Твоя база: баланс токенов $STON, TON-кошелек, уникальные ачивки и рейтинг игроков.\n\n` +
      `🎯 <b>Миссии (Quests & Bounties)</b>\n` +
      `Интерактивные квесты и ежедневные задания с мгновенным начислением очков опыта.\n\n` +
      `🔄 <b>Fast Swap & Стейкинг</b>\n` +
      `Моментальный обмен токенов прямо в игре и пассивный доход до 78.5% APY.\n\n` +
    `<i>STONE IS LOVE. STONE IS LIFE. 🪨🔥</i>${refText}\n\n` +
      `Нажми на кнопку ниже, чтобы войти в портал и активировать своего персонажа! 👇`;

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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } 
  // Обработка /help
  else if (text === '/help') {
    const helpMessage = `❓ <b>Как устроен STON Hub?</b>\n\n` +
      `1. Нажмите кнопку <b>Открыть STON Hub 🗿🟠</b>.\n` +
      `2. Подключите свой TON-кошелек (например, Tonkeeper).\n` +
      `3. Зайдите в раздел <b>«Видео»</b>, посмотрите гайды и сдайте тесты.\n` +
      `4. Выполняйте ежедневные квесты в разделе <b>«Миссии»</b>.\n` +
      `5. Получайте XP, прокачивайте игровой уровень и поднимайтесь в топ игроков в <b>«Профиле»</b>!\n\n` +
      `<i>STONE IS LOVE. STONE IS LIFE. 🪨🔥</i>`;

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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: helpMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } 
  // Любое другое сообщение
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
