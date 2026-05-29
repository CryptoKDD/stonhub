/**
 * STONHub Local Bot Simulator (Long Polling)
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

console.log('\x1b[36m%s\x1b[0m', 'STONHub Bot Simulator запущен...');
console.log(`URL Приложения: ${APP_URL}`);
console.log('Ожидание сообщений от Telegram (Long Polling)... Прервать: Ctrl+C\n');

let lastUpdateId = 0;

// Функция отправки POST запросов к API Telegram
function callTelegramAPI(method, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
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
  const firstName = message.from?.first_name || 'Пользователь';
  const username = message.from?.username ? `@${message.from.username}` : 'без юзернейма';

  console.log(`[Сообщение] От: ${firstName} (${username}) | Текст: "${text}"`);

  // Обработка /start
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

    await callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text: helpMessage,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } 
  // Любое другое сообщение
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
