# 🏛️ Ashıq Byudjet — Netlify Deploy Qılıw Qollanması

---

## 📁 Fayl dúzilisi

```
web sayt ham telegram bot/
├── index.html                        ← Bas bet (Qoraqolpoq tilinde)
├── style.css                         ← Dizayn
├── script.js                         ← Frontend logikası
├── netlify.toml                      ← Netlify sazlaması
├── package.json                      ← Netlify Functions ushın paketler
└── netlify/
    └── functions/
        ├── webhook.js                ← Telegram Webhook
        ├── send-otp.js               ← OTP jiberiw
        ├── verify-otp.js             ← OTP tekserиw
        ├── vote.js                   ← Dawıs beriw
        └── projects.js               ← Jobalar dizimi
```

---

## 🚀 1-QADAM: Telegram Bot Jaratiw

1. Telegramda **[@BotFather](https://t.me/BotFather)** nı ashıń
2. `/newbot` jaziń
3. Bot atın kiritiń (mısalı: `Ashiq Byudjet`)
4. Bot username kiritiń (oxiri `bot` menen tamamlanıwı kerek)
   - Mısalı: `ashiqbyudjetbot`
5. **TOKEN** nı nusxalap alıń (usı kóriniste boladi):
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

---

## 🌐 2-QADAM: GitHub ga jüklew

1. **[github.com](https://github.com)** da akkaunt ashıń (bepul)
2. Jańa repository jaratiń: `ashiq-byudjet`
3. Barlıq fayllarıńızdı júklep qoyıń

**Yamasa GitHub Desktop ilovası arqalı:**
1. [desktop.github.com](https://desktop.github.com) dan júklep ornatıń
2. "Add existing repository" → papkańızdı saylań
3. "Publish repository" túymesın basıń

---

## ⚡ 3-QADAM: Netlify ga deploy etiw

1. **[netlify.com](https://netlify.com)** ga kiriń (GitHub akkaunt menen)
2. **"Add new site"** → **"Import an existing project"**
3. **GitHub** nı saylań → repozitoriyańızdı tabıń
4. Sazlamalar:
   - **Build command:** (bos qaldırıń)
   - **Publish directory:** `.` (nuqta)
5. **"Deploy site"** basıń

Netlify sizge URL beredi, mısalı:
```
https://ashiq-byudjet.netlify.app
```

---

## 🔑 4-QADAM: Environment Variables (Sır sozlamalar)

Netlify dashboard da:
**Site settings → Environment variables → Add variable**

| O'zgaruvchi | Qıymeti | Mısal |
|---|---|---|
| `BOT_TOKEN` | BotFatherdan alınan token | `1234567890:ABCdef...` |
| `BOT_USERNAME` | Bot username (@ sız) | `ashiqbyudjetbot` |
| `OTP_SECRET` | Islegen quramalı sóz | `mysecret2025xyz` |
| `ADMIN_ID` | Sizińizdińiź Telegram ID (ixtiyariy) | `123456789` |

> 💡 **Telegram ID** nı biliw ushın [@userinfobot](https://t.me/userinfobot) ga `/start` jaziń

---

## 🤖 5-QADAM: Telegram Webhook Ornatiw

Deploy bolgannan keyin, brauzerda usı linkni ashıń
**(BOT_TOKEN hám SAYT_URL ni ózińiznikine almastiyrıń):**

```
https://api.telegram.org/botBOT_TOKEN/setWebhook?url=https://SAYT_URL/.netlify/functions/webhook
```

**Mısal:**
```
https://api.telegram.org/bot1234567890:ABCdef/setWebhook?url=https://ashiq-byudjet.netlify.app/.netlify/functions/webhook
```

Muvaffaqiyatlı bolsa usı jauwaptı kóresiz:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

## ✅ 6-QADAM: Testlaw

### Bot testı:
1. Telegram da botıńızdı ashıń: `@kolyabot`
2. `/start` jaziń
3. **"📱 Telefon noimerimi ulasıw"** túymesın basıń
4. Telefon nomerin ulasıń → ✅ sátti xabar keliwi kerek

### Sayt testı:
1. `https://ashiq-byudjet.netlify.app` nı ashıń
2. **"Kiriw"** túymesın basıń
3. Telefon nomerin kiritiń → Telegramga kod keliwi kerek
4. Kodtı kiritiń → Sistemage kiriw → Dawıs beriw

---

## ❓ Kóp ushırasatıǵın máseleler

| Mashqala | Sheshim |
|---|---|
| Webhook ornatılmadı | BOT_TOKEN nı dúris kiritkeniñizdi tekserіń |
| Kod kelmeyapti | Aldın botda /start basıp telefon ulasıń |
| Functions islemeyt | Netlify da BOT_TOKEN env variable bar ekenin tekserіń |
| Sayt ashılmaydi | netlify.toml faylı to'g'ri ekenin tekserіń |

---

## 📞 Baylanıs

- 📞 Tel: +998 71 203 00 00
- 🤖 Bot: [@kolyabot](https://t.me/kolyabot)
