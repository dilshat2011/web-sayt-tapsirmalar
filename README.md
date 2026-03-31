# 🏛️ Open Budjet — Tashabbusli Byudjet

Fuqarolar loyihalarga ovoz beradigan platforma. Web sayt + Telegram bot.

---

## 📁 Fayl tuzilishi

```
web sayt ham telegram bot/
├── index.html          ← Asosiy sahifa
├── style.css           ← Dizayn
├── script.js           ← Frontend logika
└── backend/
    ├── server.js       ← Express server + Telegram bot
    ├── package.json    ← Paketlar
    ├── .env            ← Sozlamalar (TOKEN)
    └── data/           ← Ma'lumotlar (avtomatik yaratiladi)
        ├── phones.json
        ├── sessions.json
        └── votes.json
```

---

## 🚀 Ishga tushirish

### 1. Node.js o'rnating (agar yo'q bo'lsa)
https://nodejs.org dan yuklab o'rnating

### 2. Telegram Bot yarating
1. Telegramda [@BotFather](https://t.me/BotFather) ni oching
2. `/newbot` yozing
3. Bot nomini kiriting
4. Bot username kiriting (oxiri `bot` bilan tugashi kerak)
5. **Token** ni nusxalab oling

### 3. .env faylni to'ldiring
`backend/.env` faylini oching va token qo'ying:
```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=sizningbotingiz
ADMIN_ID=sizning_telegram_id  ← ixtiyoriy
```

> Telegram ID ni bilish uchun [@userinfobot](https://t.me/userinfobot) ga yozing

### 4. Paketlarni o'rnating
```bash
cd backend
npm install
```

### 5. Serverni ishga tushiring
```bash
npm start
```

### 6. Saytni oching
Brauzerda: **http://localhost:3000**

---

## 🤖 Telegram Bot ishlatish

1. **Botni ishga tushiring**: `@sizningbotingiz` ga /start yozing
2. **Telefon ulashing**: "📱 Telefon raqamimni ulashish" tugmasini bosing
3. **Web saytga o'ting**: http://localhost:3000
4. **Telefon kiriting**: Login formasida raqamingizni kiriting
5. **Kodni kiriting**: Telegram botdan kelgan 4 xonali kodni kiriting
6. **Ovoz bering**: Loyihalarni ko'ring va ovoz bering!

---

## 📡 API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| GET | `/api/projects` | Barcha loyihalar |
| POST | `/api/send-otp` | OTP yuborish |
| POST | `/api/verify-otp` | OTP tekshirish |
| POST | `/api/vote` | Ovoz berish |
| GET | `/api/check-user/:phone` | Foydalanuvchi holati |
| GET | `/api/stats` | Statistika |
| GET | `/api/health` | Server holati |

---

## ⚙️ Demo rejim

Agar server ishlamasa ham sayt ishlaydi:
- Istalgan 4 xonali kod qabul qilinadi
- Ovozlar brauzer xotirasida saqlanadi

---

## 📞 Aloqa

Tel: +998 71 203 00 00
