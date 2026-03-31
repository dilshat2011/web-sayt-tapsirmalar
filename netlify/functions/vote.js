// Ovoz berish — Netlify Blobs da saqlaydi
const { getStore } = require('@netlify/blobs');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

const projects = [
  { id: 1, icon: '🏗️', category: 'Infrastruktura', name: "Kósheni rawajlandırıw", desc: "Shımbay rayonındaǵı tiykarǵı kóshelerdı zámanagóy órtewler menen tólewlew.", votes: 312, maxVotes: 500 },
  { id: 2, icon: '🌳', category: 'Ekologiya', name: "Jasıl park qurıw", desc: "Nókis qalasında 2 gektarlıq aymaqta zámanagóy dem alıs bagın barpo etiw.", votes: 278, maxVotes: 500 },
  { id: 3, icon: '📚', category: "Bilimlendiriw", name: "Mektep kitebanasın modernizatsiyalaw", desc: "34-mektep kitebanasına zámanagóy kompyuterler hám jańa kitaplar qosıw.", votes: 445, maxVotes: 500 },
  { id: 4, icon: '🏥', category: "Sálametliklendiriw", name: "Poliklinika abzallandırıw", desc: "5-qala poliklinikasına zámanagóy medicinlıq qurallar satıp alıw.", votes: 389, maxVotes: 500 },
  { id: 5, icon: '💧', category: 'Infrastruktura', name: "Ishimilik suw sisteması", desc: "Beruniy rayonındaǵı 3 mahallede jańa suw taminatı qubırların salıw.", votes: 201, maxVotes: 500 },
  { id: 6, icon: '🎭', category: "Bilimlendiriw", name: "Jaslar oraylın ashıw", desc: "Qońırat rayonında sport, óner hám texnologiya úyirmelerin ózinde jámlegen jaslar orayın.", votes: 356, maxVotes: 500 }
];

function formatPhone(raw) {
  return raw.replace(/\D/g, '').replace(/^998/, '').slice(-9);
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
    const { phone, projectId } = JSON.parse(event.body || '{}');
    if (!phone || !projectId) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Maǵlıwmat jetispeydi' }) };

    const normalPhone = formatPhone(phone);
    const pid = parseInt(projectId);
    const project = projects.find(p => p.id === pid);
    if (!project) return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Joba tabılmadı' }) };

    // Avval ovoz berilganmi?
    const voteStore = getStore('votes');
    const voteKey = `${normalPhone}-${pid}`;
    let existing;
    try { existing = await voteStore.get(voteKey); } catch {}

    if (existing) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Siz bul jobaǵa allaqashan dawıs berdińiz' }) };
    }

    // Ovoz saqlash
    await voteStore.set(voteKey, JSON.stringify({ phone: normalPhone, projectId: pid, votedAt: new Date().toISOString() }));

    // Ovoz sonini hisoblash
    project.votes += 1;

    // Telegram xabari
    const phoneStore = getStore('phones');
    let userInfo;
    try { userInfo = await phoneStore.get(normalPhone, { type: 'json' }); } catch {}
    if (userInfo?.chatId) {
      fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userInfo.chatId,
          text: `🗳️ *Dawısıńız qabıl etildi!*\n\n✅ Joba: *${project.name}*\n\nDawısıńız ushın rahmet! 🙏`,
          parse_mode: 'Markdown'
        })
      }).catch(() => {});
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Dawısıńız qabıl etildi!', project }) };
  } catch (err) {
    console.error('vote xatosi:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server qatesi: ' + err.message }) };
  }
};
