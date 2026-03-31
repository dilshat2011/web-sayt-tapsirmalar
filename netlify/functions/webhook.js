// Telegram Webhook — Netlify Function
// Foydalanuvchi /start yozganda yoki telefon ulashganda ishlaydi
const { getStore } = require('@netlify/blobs');

const BOT_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

async function tg(chatId, text, extra = {}) {
  return fetch(`${BOT_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', ...extra })
  }).then(r => r.json()).catch(() => {});
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const update = JSON.parse(event.body || '{}');
    const msg = update.message;
    if (!msg) return { statusCode: 200, body: 'ok' };

    const chatId   = msg.chat.id;
    const tgId     = msg.from.id;
    const firstName = msg.from.first_name || 'Paydalanıwshı';
    const lastName  = msg.from.last_name  || '';
    const fullName  = `${firstName} ${lastName}`.trim();

    // ──────────── /start ────────────
    if (msg.text === '/start') {
      await tg(chatId,
        `👋 Assalawma áleykum, *${firstName}*!\n\n` +
        `🏛️ *Ashıq Byudjet* portalına xosh keldiñiz!\n\n` +
        `Bul bot arqalı siz:\n` +
        `📱 Telefon nomerińizdi dizimge ala alasız\n` +
        `🔐 Tastıyıqlaw kodın qabıl ete alasız\n` +
        `🗳️ Jobalarǵa dawıs bere alasız\n\n` +
        `▶️ Dizimge alıw ushın tómendegi túymeni basıp,\n` +
        `telefon nomerińizdi jiberiń:`,
        {
          reply_markup: JSON.stringify({
            keyboard: [[{ text: '📱 Telefon nomerimdi jiberiw', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          })
        }
      );
      return { statusCode: 200, body: 'ok' };
    }

    // ──────────── /yordam ────────────
    if (msg.text === '/yordam' || msg.text === '/help') {
      await tg(chatId,
        `📋 *Járdem bólimi*\n\n` +
        `*/start* — Botdı іske qosıw\n` +
        `*/status* — Meniń jaǵdayım\n` +
        `*/yordam* — Járdem\n\n` +
        `🌐 Portal: ashıqbyudjet.netlify.app\n` +
        `📞 Tel: +998 71 203 00 00`
      );
      return { statusCode: 200, body: 'ok' };
    }

    // ──────────── /status ────────────
    if (msg.text === '/status') {
      const store = getStore('phones');
      let userPhone = null;
      try {
        const list = await store.list();
        for (const entry of list.blobs) {
          const d = await store.get(entry.key, { type: 'json' });
          if (d?.telegramId === tgId.toString()) { userPhone = entry.key; break; }
        }
      } catch {}

      if (userPhone) {
        const vStore = getStore('votes');
        let voteCount = 0;
        try {
          const vList = await vStore.list({ prefix: `${userPhone}-` });
          voteCount = vList.blobs.length;
        } catch {}

        await tg(chatId,
          `👤 *Siziń jaǵdayıńız:*\n\n` +
          `📱 Telefon: +998${userPhone}\n` +
          `✅ Siz dizimge alınǵansız\n` +
          `🗳️ Berılgen dawıslar sanı: *${voteCount}*\n\n` +
          `Portal: ashıqbyudjet.netlify.app`
        );
      } else {
        await tg(chatId,
          `❌ Siz ele dizimge alınbaǵansız.\n\n` +
          `Dizimge alıw ushın /start túymesin basıń!`
        );
      }
      return { statusCode: 200, body: 'ok' };
    }

    // ──────────── Kontakt (telefon) ────────────
    if (msg.contact) {
      const contact = msg.contact;

      // Faqat o'z telefoni
      if (contact.user_id !== tgId) {
        await tg(chatId,
          `⚠️ Iltimas, tek *ózińizdiń* telefon nomerińizdi ulasıń.`,
          { reply_markup: JSON.stringify({ remove_keyboard: true }) }
        );
        return { statusCode: 200, body: 'ok' };
      }

      // Telefon raqamini normallash
      let phone = contact.phone_number.replace(/\D/g, '');
      if (phone.startsWith('998')) phone = phone.slice(3);
      phone = phone.slice(-9);

      // Netlify Blobs ga saqlash
      const store = getStore('phones');
      await store.set(phone, JSON.stringify({
        telegramId: tgId.toString(),
        chatId:     chatId.toString(),
        name:       fullName,
        registeredAt: new Date().toISOString()
      }));

      await tg(chatId,
        `✅ *Sátti dizimge alındıńız!*\n\n` +
        `📱 Telefon: +998${phone}\n` +
        `👤 Atı-jónińiz: ${fullName}\n\n` +
        `Endi *Ashıq Byudjet* saytına kirip,\n` +
        `telefon nomerińizdi kiritiń.\n\n` +
        `Tastıyıqlaw kodı sonnan keledi! 🔐`,
        { reply_markup: JSON.stringify({ remove_keyboard: true }) }
      );

      // Admin xabardorligi
      if (process.env.ADMIN_ID) {
        tg(process.env.ADMIN_ID,
          `🆕 Jańa paydalanıwshı:\n` +
          `👤 ${fullName}\n` +
          `📱 +998${phone}\n` +
          `🆔 TG: ${tgId}`
        ).catch(() => {});
      }

      return { statusCode: 200, body: 'ok' };
    }

    // ──────────── Boshqa xabar ────────────
    if (msg.text && !msg.text.startsWith('/')) {
      await tg(chatId,
        `ℹ️ Botdan paydalanıw ushın /start nı basıń.\n\n` +
        `🌐 Sayt: ashıqbyudjet.netlify.app`
      );
    }

    return { statusCode: 200, body: 'ok' };

  } catch (err) {
    console.error('Webhook qatesi:', err.message);
    return { statusCode: 200, body: 'ok' }; // Telegramga har doim 200
  }
};
