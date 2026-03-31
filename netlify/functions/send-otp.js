// OTP yuborish — Telefon raqam bo'yicha Telegram chatga kod yuboradi
const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const SECRET = process.env.OTP_SECRET || 'openbudjet_secret_2025';

function formatPhone(raw) {
  return raw.replace(/\D/g, '').replace(/^998/, '').slice(-9);
}

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// HMAC bilan token yaratish (DB siz OTP saqlash)
function createToken(phone, otp) {
  const ts = Date.now();
  const payload = `${phone}:${otp}:${ts}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 12);
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };

  try {
    const { phone } = JSON.parse(event.body || '{}');
    if (!phone) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Telefon nomeri kiritilmegen' }) };

    const normalPhone = formatPhone(phone);
    if (normalPhone.length < 9) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Telefon nomeri qate' }) };
    }

    // Telefon → ChatId topish
    const phoneStore = getStore('phones');
    let userInfo;
    try {
      userInfo = await phoneStore.get(normalPhone, { type: 'json' });
    } catch (e) { }

    if (!userInfo) {
      const botLink = `https://t.me/${process.env.BOT_USERNAME || 'openbudjetbot'}`;
      return {
        statusCode: 404, headers,
        body: JSON.stringify({
          success: false,
          message: 'Bul telefon Telegram botta dizimge alınbaǵan. Aldın bottı iske qosıp, nomerińizdi jiberiń.',
          botLink
        })
      };
    }

    // OTP yaratish va yuborish
    const otp = generateOTP();
    const token = createToken(normalPhone, otp);

    // Telegramga yuborish
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userInfo.chatId,
        text: `🔐 *Tastıyıqlaw kodı*\n\nSiziń kodıńız: *${otp}*\n\n⏰ Kod 2 minutta ámelde boladı.\n⚠️ Bul kodtı heshkimge bermeń!\n\n_Eger siz bul sorawdı jibermegen bolsańız, oǵan itibar bermeń._`,
        parse_mode: 'Markdown'
      })
    });

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, message: 'Kod Telegram arqalı jiberildi', token })
    };

  } catch (err) {
    console.error('send-otp xatosi:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server qatesi: ' + err.message }) };
  }
};
