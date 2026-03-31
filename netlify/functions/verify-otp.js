// OTP tekshirish — Token va kodni tekshiradi
const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const SECRET = process.env.OTP_SECRET || 'openbudjet_secret_2025';
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

function formatPhone(raw) {
  return raw.replace(/\D/g, '').replace(/^998/, '').slice(-9);
}

function verifyToken(phone, otp, token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 4) return { valid: false, reason: 'format' };
    const [tPhone, tOtp, ts, sig] = parts;
    // Muddati: 2 daqiqa
    if (Date.now() - parseInt(ts) > 2 * 60 * 1000) return { valid: false, reason: 'expired' };
    if (tPhone !== phone) return { valid: false, reason: 'phone' };
    if (tOtp !== otp.toString().trim()) return { valid: false, reason: 'wrong' };
    const expected = crypto.createHmac('sha256', SECRET).update(`${tPhone}:${tOtp}:${ts}`).digest('hex').slice(0, 12);
    if (sig !== expected) return { valid: false, reason: 'tampered' };
    return { valid: true };
  } catch { return { valid: false, reason: 'error' }; }
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false }) };

  try {
    const { phone, code, token } = JSON.parse(event.body || '{}');
    if (!phone || !code || !token) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Maǵlıwmat jetispeydi' }) };
    }

    const normalPhone = formatPhone(phone);
    const result = verifyToken(normalPhone, code, token);

    if (!result.valid) {
      const msgs = {
        expired: 'Kod múddeti ótti. Jańadan sorap kóriń.',
        wrong: 'Qate kod. Qayta urınıp kóriń.',
        phone: 'Telefon nomeri tuwrı kelmedi.',
        tampered: 'Kod qátelik penen kelgen. Jańadan sorap kóriń.',
        default: 'Qate kod.'
      };
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: msgs[result.reason] || msgs.default }) };
    }

    // ChatId topish
    const phoneStore = getStore('phones');
    let userInfo;
    try { userInfo = await phoneStore.get(normalPhone, { type: 'json' }); } catch {}

    // Telegram xabari
    if (userInfo?.chatId) {
      fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userInfo.chatId,
          text: `✅ *Sátti kirdińiz!*\n\n🕐 ${new Date().toLocaleString('kaa-UZ')}\n\nEndi jobalarǵa dawıs bere alasız! 🗳️`,
          parse_mode: 'Markdown'
        })
      }).catch(() => {});
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true,
        message: 'Sátti kirdińiz!',
        user: { phone: normalPhone, name: userInfo?.name || '' }
      })
    };
  } catch (err) {
    console.error('verify-otp xatosi:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server qatesi' }) };
  }
};
