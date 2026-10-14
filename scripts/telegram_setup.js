#!/usr/bin/env node
/**
 * Automated Telegram Bot Configuration Script
 * Configures the Menu Button (Mini App URL), Webhook, Commands, and Descriptions
 * via Telegram Bot API without manual BotFather command loops.
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.WEBHOOK_URL || process.env.APP_URL;

if (!botToken || botToken.includes('ExampleToken')) {
  console.error('❌ Error: Se requiere TELEGRAM_BOT_TOKEN válido en las variables de entorno o argumento.');
  console.error('Uso: node scripts/telegram_setup.js <BOT_TOKEN> <APP_URL_HTTPS>');
  process.exit(1);
}

const targetUrl = process.argv[3] || appUrl;
const targetToken = process.argv[2] || botToken;

const API_BASE = `https://api.telegram.org/bot${targetToken}`;

async function callTelegram(method, payload = {}) {
  const url = `${API_BASE}/${method}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, description: err.message };
  }
}

async function runSetup() {
  console.log('🤖 Conectando con Telegram Bot API...');

  // 1. Obtener información del Bot
  const me = await callTelegram('getMe');
  if (!me.ok) {
    console.error(`❌ Falló la autenticación del Bot: ${me.description}`);
    process.exit(1);
  }
  console.log(`✅ Bot autenticado con éxito: @${me.result.username} (${me.result.first_name})`);

  // 2. Configurar Comandos oficiales
  console.log('📋 Registrando comandos /start y /pet...');
  const commandsRes = await callTelegram('setMyCommands', {
    commands: [
      { command: 'start', description: 'Abrir el juego y reclamar bonos de socio' },
      { command: 'pet', description: 'Consultar estado vital de tu mascota Quino' },
      { command: 'help', description: 'Guía de juego y soporte' }
    ]
  });
  console.log(commandsRes.ok ? '✅ Comandos registrados.' : `⚠️ Advertencia comandos: ${commandsRes.description}`);

  // 3. Configurar Descripciones del Bot
  console.log('📝 Actualizando descripciones de presentación...');
  await callTelegram('setMyDescription', {
    description: '🐾 Idle Pet Tycoon: Cria a tu mascota Quino, administra negocios e imperios incrementales y escala tus ganancias pasivas en Telegram.'
  });
  await callTelegram('setMyShortDescription', {
    short_description: '🐾 Idle Tycoon + Virtual Pet en Telegram Mini App.'
  });

  // 4. Configurar Botón de Menú (Mini App WebApp)
  if (targetUrl && targetUrl.startsWith('https://')) {
    console.log(`🌐 Asignando WebApp Menu Button con URL: ${targetUrl}`);
    const menuRes = await callTelegram('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: 'JUGAR 🐾',
        web_app: { url: targetUrl }
      }
    });
    console.log(menuRes.ok ? '✅ Botón de menú "JUGAR 🐾" configurado con éxito.' : `⚠️ Advertencia menú: ${menuRes.description}`);

    // 5. Configurar Webhook para pagos Stars y eventos de miembros
    const webhookUrl = `${targetUrl.replace(/\/$/, '')}/webhook/telegram`;
    console.log(`🔗 Configurando Webhook: ${webhookUrl}`);
    const webhookRes = await callTelegram('setWebhook', {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query', 'chat_member', 'pre_checkout_query', 'successful_payment']
    });
    console.log(webhookRes.ok ? '✅ Webhook registrado correctamente.' : `⚠️ Advertencia webhook: ${webhookRes.description}`);
  } else {
    console.log('ℹ️ Para vincular la Mini App al botón de menú, proporciona una URL HTTPS válida.');
  }

  console.log('\n🎉 ¡Configuración de Telegram finalizada exitosamente!');
}

runSetup();
