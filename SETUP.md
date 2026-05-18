# Jazz Xata Cottage Rental Website — Complete Setup Guide

A beautiful, bilingual (English/Ukrainian) booking website for Jazz Xata cottage in the Carpathians, with direct booking, Stripe payments, and Airbnb/Booking.com reviews.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ installed ([download](https://nodejs.org/))
- A code editor (VS Code, Sublime, etc.)

### Step 1: Install Dependencies
```bash
cd "/Users/emilegable/Documents/Claude/Projects/Jazz Xata Website"
npm install
```

### Step 2: Create `.env` File
Copy the example and add your keys:
```bash
cp .env.example .env
```

Then open `.env` and fill in the placeholder values (see **Getting API Keys** below).

### Step 3: Run Locally
```bash
npm start
```

Open your browser to `http://localhost:3001` and you should see the site!

---

## 🔑 Getting API Keys (What You Need)

### 1. **Stripe** (for payments)
1. Go to [stripe.com](https://stripe.com) and sign up (free)
2. Dashboard → Developers → API keys
3. Copy your **Publishable Key** (pk_test_...) and **Secret Key** (sk_test_...)
4. Paste into `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   ```

### 2. **MongoDB** (database)
We use MongoDB Atlas (free tier):
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up and create a free cluster
3. Create a user account for the database
4. Get your connection string (should look like: `mongodb+srv://user:pass@cluster.mongodb.net/jazz_xata?retryWrites=true&w=majority`)
5. Paste into `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/jazz_xata?retryWrites=true&w=majority
   ```

### 3. **Email** (for booking confirmations)
**Option A: Gmail (Recommended — Simple)**
1. Create a Gmail account or use existing
2. Enable 2-Factor Authentication (Settings → Security)
3. Create an App Password: https://myaccount.google.com/apppasswords
4. Add to `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_SERVICE=gmail
   ```

**Option B: Other Services**
- SendGrid, Mailgun, or Resend (similar setup)

### 4. **Other Settings**
```env
OWNER_EMAIL=your-email@gmail.com    # Where you receive booking notifications
ADMIN_TOKEN=super_secret_random_token
PORT=3001
```

---

## 🧪 Testing Locally

### Test Payment
1. Open the site on `http://localhost:3001`
2. Select dates, fill in details
3. Use test card: **4242 4242 4242 4242**
4. Any future expiry date and any CVC (e.g., 12/25, 123)
5. You should see a success message and receive an email

### Test Email
Check your spam folder if the email doesn't arrive. Gmail often filters automated emails.

---

## 📁 Project Structure

```
Jazz Xata Website/
├── index.html              # Main website (frontend)
├── admin.html              # Admin panel (manage bookings)
├── server.js               # Backend API
├── package.json            # Dependencies
├── .env.example           # Environment template
├── vercel.json            # Vercel deployment config
└── SETUP.md               # This file
```

### Key Features

| Feature | Status |
|---------|--------|
| Direct booking with calendar | ✅ Built |
| Stripe payment integration | ✅ Built |
| Bilingual (EN/UK) | ✅ Built |
| Guest email confirmations | ✅ Built |
| Owner notifications | ✅ Built |
| Airbnb/Booking.com reviews | ✅ Built |
| Admin panel for date blocking | ✅ Built |
| Responsive mobile design | ✅ Built |

---

## 🎨 Customization

### Change Pricing
Edit `server.js` around line 123:
```javascript
const pricingSeasons = [
  { months: [11, 12, 1, 2, 3], pricePerNight: 80 },   // Low season (Nov-Mar)
  { months: [4, 10], pricePerNight: 120 },             // Mid season (Apr, Oct)
  { months: [5, 6, 7, 8, 9], pricePerNight: 180 }     // High season (May-Sep)
];
```

### Change Minimum Stay
Edit `server.js` line 42:
```javascript
const MIN_STAY = 2; // Minimum nights (change to 3, 4, etc.)
```

### Update Reviews
Edit the reviews in `index.html` around line 1295. Add/remove reviews or change the text.

### Change Currency
Currently set to EUR (€). To change:
1. In `server.js`, change `currency: 'eur'` to your currency code
2. In `index.html`, replace `€` with your symbol

### Update Content
All text is in `index.html`. Search for `data-en` and `data-uk` attributes to find English/Ukrainian text.

---

## 🚢 Deploy to Vercel (Production)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Jazz Xata website"
git branch -M main
git remote add origin https://github.com/yourusername/jazz-xata.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click Deploy (Vercel auto-detects your setup)
4. In Project Settings → Environment Variables, add:
   - `MONGODB_URI`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `OWNER_EMAIL`
   - `ADMIN_TOKEN`

### Step 3: Update Frontend Config
In `index.html` (around line 958), update the API base:
```javascript
const API_BASE = 'https://your-site.vercel.app/api';
```

Also update the Stripe publishable key with your production key (not test key).

---

## 🛠 Troubleshooting

### "Cannot GET /" or page won't load
- Make sure Node.js is installed: `node --version`
- Make sure you're in the right directory
- Try: `npm install` again, then `npm start`

### Emails not sending
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Check Stripe test vs production keys
- Gmail: verify the app password is correct (not regular password)
- Check spam folder
- Make sure OWNER_EMAIL is set

### Payment not working
- Use test card `4242 4242 4242 4242`
- Make sure STRIPE_PUBLISHABLE_KEY is in `index.html` (line 959)
- Check browser console (F12) for errors

### Database connection error
- Verify MONGODB_URI is correct
- Check MongoDB Atlas has your IP whitelisted
- Make sure database user credentials are correct

### Local works but Vercel doesn't
- Environment variables in Vercel must match .env keys exactly
- Check Vercel build logs: vercel.com → your project → Deployments
- Make sure you pushed latest code to GitHub

---

## 📞 Support

**For Stripe issues:** [stripe.com/support](https://stripe.com/support)
**For MongoDB issues:** [mongodb.com/support](https://www.mongodb.com/support)
**For Vercel issues:** [vercel.com/support](https://vercel.com/support)

---

## 🌍 Languages

The site is fully bilingual. Guests can toggle between English and Ukrainian using the language button in the top-right. All content is automatically translated:
- Navigation
- Descriptions
- Booking form
- Emails
- Reviews

---

## 🔐 Admin Panel

Access at `/admin.html`:
1. Password: `jazzxata1` (change in `server.js` line 406)
2. You can:
   - View all bookings
   - Block dates for maintenance or personal use
   - See booking details and payments

---

## ✅ Deployment Checklist

Before going live:
- [ ] Test booking with payment locally
- [ ] Update cottage photos in gallery (index.html lines 698-712)
- [ ] Update reviews with real guest reviews
- [ ] Change admin password
- [ ] Update OWNER_EMAIL to your email
- [ ] Use production Stripe keys (not test keys)
- [ ] Test payment on live site
- [ ] Verify booking emails arrive
- [ ] Share site URL with friends for testing

---

**Made with ❤️ in the Carpathians**
