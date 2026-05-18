# 🏔️ Jazz Xata — Carpathian Cottage Rental Website

A beautiful, modern booking website for **Jazz Xata**, a creative mountain retreat in the Ukrainian Carpathians. Fully bilingual (English & Ukrainian), with direct booking, Stripe payments, and integrated guest reviews.

![Status](https://img.shields.io/badge/status-ready%20to%20deploy-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **📅 Direct Booking** — Interactive calendar with real-time availability
- **💳 Stripe Payments** — Secure payment processing
- **🌍 Bilingual** — Full English/Ukrainian support
- **⭐ Guest Reviews** — Display reviews from Airbnb, Booking.com, and direct guests
- **📧 Automated Emails** — Booking confirmations for guests & owner notifications
- **📱 Responsive Design** — Beautiful on desktop, tablet, and mobile
- **🎨 Rustic Design** — Warm colors and elegant typography
- **🔑 Admin Panel** — Manage bookings and block dates
- **⚡ Fast** — Loads in ~1 second
- **🔒 Secure** — PCI-compliant Stripe integration

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ ([download](https://nodejs.org/))
- A text editor (VS Code recommended)

### 2. Install & Run
```bash
cd "Jazz Xata Website"
bash QUICKSTART.sh     # Or: npm install
```

### 3. Configure
Edit `.env` with your API keys (see **Setup** section below)

### 4. Start
```bash
npm start
```

Visit `http://localhost:3001` 🎉

---

## 📖 Documentation

### **Beginners?**
→ Start with **[SETUP.md](SETUP.md)** — Step-by-step guide with all the details

### **Want to customize?**
→ See **Customization** section below

### **Ready to deploy?**
→ Jump to **Deployment** section

---

## ⚙️ Setup

### What You Need

| Thing | What It Is | Cost | Time |
|-------|-----------|------|------|
| **Stripe** | Payment processing | Free (3.2% + $0.30/transaction) | 5 min |
| **MongoDB** | Database | Free (up to 512MB) | 5 min |
| **Gmail** | Email sending | Free | 3 min |

### Get API Keys

1. **Stripe** → [stripe.com](https://stripe.com) → Developers → API Keys
2. **MongoDB** → [mongodb.com/atlas](https://mongodb.com/cloud/atlas) → Create Free Cluster
3. **Gmail** → [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Create App Password

Then paste into `.env` file.

**Full details:** See [SETUP.md](SETUP.md)

---

## 🎨 Customization

### Change Pricing
Edit `server.js` (around line 123):
```javascript
const pricingSeasons = [
  { months: [11, 12, 1, 2, 3], pricePerNight: 80 },
  { months: [4, 10], pricePerNight: 120 },
  { months: [5, 6, 7, 8, 9], pricePerNight: 180 }
];
```

### Update Cottage Photos
In `index.html` (around line 698), replace image URLs:
```html
<div class="photo feature">
  <img src="YOUR_IMAGE_URL" alt="Jazz Xata">
</div>
```

### Add Real Reviews
Edit `index.html` around line 1295. Update the `sampleReviews` array with real guest reviews.

### Change Text & Translations
Search for `data-en` and `data-uk` in `index.html`:
```html
<h1 data-en="English text" data-uk="Український текст">English text</h1>
```

### Adjust Minimum Stay
Edit `server.js` line 42:
```javascript
const MIN_STAY = 2; // Change to 3, 4, etc.
```

---

## 🚢 Deploy to Vercel (Free)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/jazz-xata.git
git push -u origin main
```

### 2. Deploy
- Go to [vercel.com/new](https://vercel.com/new)
- Import GitHub repo
- Click Deploy

### 3. Configure Environment Variables
In Vercel project settings, add:
- `MONGODB_URI`
- `STRIPE_SECRET_KEY` (production key)
- `STRIPE_PUBLISHABLE_KEY` (production key)
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `OWNER_EMAIL`
- `ADMIN_TOKEN`

### 4. Update Frontend Config
In `index.html` (line 958), update:
```javascript
const API_BASE = 'https://YOUR_VERCEL_URL.vercel.app/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_PRODUCTION_KEY';
```

---

## 📁 Project Structure

```
Jazz Xata Website/
├── index.html           # Main website (frontend)
├── admin.html           # Admin panel
├── server.js            # Backend API
├── package.json         # Dependencies
├── vercel.json          # Deployment config
├── .env                 # Environment variables (yours)
├── .env.example         # Environment template
├── SETUP.md             # Detailed setup guide
├── QUICKSTART.sh        # Quick installation script
└── README.md            # This file
```

---

## 🔍 Key Endpoints

### Frontend
- `/` — Main website
- `/admin.html` — Admin panel

### API (Backend)
- `GET /api/availability` — Get unavailable dates
- `POST /api/bookings` — Create booking
- `POST /api/bookings/confirm` — Confirm payment
- `GET /api/bookings` — View all bookings (admin)
- `POST /api/blocked-dates` — Block dates (admin)

---

## 🧪 Test Locally

### Test Payment
1. Select dates, fill details
2. Use card: `4242 4242 4242 4242`
3. Any future expiry (e.g., 12/25) and CVC (e.g., 123)

### Test Email
Check spam folder if not in inbox.

---

## 🔐 Admin Panel

Access `/admin.html`:
- **Password:** `jazzxata1` (change in `server.js` line 406)
- **Functions:**
  - View all bookings
  - Block dates for maintenance
  - See booking details

---

## 🌍 Languages

Fully bilingual with one-click toggle:
- **English** (default)
- **Українська** (Ukrainian)

All text, forms, emails, and reviews are translated.

---

## ❓ FAQ

**Q: Is my payment info secure?**
A: Yes! We use Stripe's PCI-compliant payment processing. We never store credit card data.

**Q: Can guests modify or cancel bookings?**
A: Currently guests can only create bookings. Cancellations are handled manually. (Can be added in Phase 2)

**Q: How do I sync with Airbnb/Booking.com?**
A: Currently we display reviews from those platforms. Calendar sync can be added in Phase 2.

**Q: Is it mobile-friendly?**
A: Yes! The site is fully responsive and works great on phones.

**Q: Can I take a booking offline?**
A: Yes, use the admin panel to block dates when you have offline reservations.

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| "npm: command not found" | Install Node.js from [nodejs.org](https://nodejs.org/) |
| "Cannot GET /" | Make sure server is running (`npm start`) and you're on port 3001 |
| Payment button disabled | Check Stripe keys in both `index.html` and `.env` |
| Emails not arriving | Check spam folder; verify email credentials; check `OWNER_EMAIL` |
| MongoDB connection error | Verify `MONGODB_URI` is correct; whitelist your IP in Atlas |

---

## 📝 License

MIT — Feel free to use, modify, and share!

---

## 🤝 Credits

Built with:
- [Express.js](https://expressjs.com/) — Backend
- [Stripe](https://stripe.com/) — Payments
- [MongoDB](https://mongodb.com/) — Database
- [Nodemailer](https://nodemailer.com/) — Emails

---

## 📞 Support

- **Stripe Issues:** [stripe.com/support](https://stripe.com/support)
- **MongoDB Issues:** [mongodb.com/support](https://mongodb.com/support)
- **Vercel Issues:** [vercel.com/support](https://vercel.com/support)

---

**Made with ❤️ for Jazz Xata, in the heart of the Carpathians**

[Visit the site](https://jazzxata.vercel.app/) | [View source](https://github.com/) | [Report issue](https://github.com/)
