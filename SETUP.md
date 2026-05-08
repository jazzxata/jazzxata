# Jazz Xata Booking System - Setup Guide

## Phase 1: Direct Booking System

This is a complete setup guide for deploying your booking system to Vercel.

---

## Step 1: Get Your API Keys

### Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Dashboard → Developers → API keys
3. Copy your **Secret Key** (sk_test_...)
4. Copy your **Publishable Key** (pk_test_...)

### Email Configuration
You need to set up email for sending confirmations. Options:

**Option A: Gmail (simplest)**
1. Create a Gmail account or use existing
2. Enable 2-Factor Authentication
3. Create an App Password: https://myaccount.google.com/apppasswords
4. Use that password in EMAIL_PASSWORD

**Option B: Other email service**
- SendGrid
- Mailgun
- Resend

### Admin Token
Generate a random secure token for the admin panel:
```
openssl rand -hex 32
```
Or just use a strong password like: `your-super-secret-admin-token-12345`

---

## Step 2: Setup Vercel Deployment

### Prerequisites
- Vercel account (free at vercel.com)
- Your project files on GitHub

### Deploy Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com/new
   - Import your GitHub repository
   - Set Environment Variables:
     - `STRIPE_SECRET_KEY`: sk_test_...
     - `STRIPE_PUBLISHABLE_KEY`: pk_test_...
     - `EMAIL_USER`: your-email@gmail.com
     - `EMAIL_PASSWORD`: your-app-password
     - `OWNER_EMAIL`: hello@jazzxata.com
     - `ADMIN_TOKEN`: your-secret-token

3. **Deploy**
   - Click Deploy
   - Your API will be live at `https://your-project.vercel.app`

---

## Step 3: Update Frontend Configuration

In `index.html`, update this line with your Vercel URL:

```javascript
const API_BASE = 'https://your-project.vercel.app/api';
```

Also update the Stripe key:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY';
```

---

## Step 4: Test Everything

### Local Testing (Optional)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your keys to `.env`

4. Start server:
   ```bash
   npm start
   ```

5. Open `file:///path/to/index.html` in browser

### Production Testing
1. Open your deployed site
2. Try booking a date range
3. Complete test payment with Stripe test card: `4242 4242 4242 4242`
4. Check your email for confirmation

---

## Stripe Test Cards

Use these cards to test payments:

| Card | Status |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 5555 5555 5555 4444 | Visa |
| 3782 822463 10005 | American Express |

Use any future expiry date and any CVC.

---

## File Structure

```
jazz-xata-website/
├── index.html                 # Frontend (updated with calendar & Stripe)
├── server.js                  # Backend API
├── package.json               # Dependencies
├── .env.example              # Environment template
├── vercel.json               # Vercel config
└── jazz_xata.db              # SQLite database (auto-created)
```

---

## API Endpoints

### For Frontend
- `GET /api/availability` - Get unavailable dates
- `POST /api/bookings` - Create booking and payment intent
- `POST /api/bookings/confirm` - Confirm payment

### For Admin
- `GET /api/bookings` - View all bookings (requires auth token)
- `POST /api/blocked-dates` - Block dates (requires auth token)

---

## Customization

### Change Pricing
Edit `server.js` lines 36-40:
```javascript
const pricingSeasons = [
  { months: [11, 12, 1, 2, 3], pricePerNight: 80 },   // Your price
  { months: [4, 10], pricePerNight: 120 },
  { months: [5, 6, 7, 8, 9], pricePerNight: 180 }
];
```

### Change Minimum Stay
Edit `server.js` line 42:
```javascript
const MIN_STAY = 2; // Change to your preference
```

### Change Currency
Update in both `server.js` and `index.html` (currently set to EUR €)

---

## Troubleshooting

### "API not found" error
- Make sure `API_BASE` URL in index.html is correct
- Check that Vercel deployment completed successfully

### "Payment declined" during test
- Use test card `4242 4242 4242 4242`
- Make sure Stripe keys are correct

### Emails not sending
- Check EMAIL_USER and EMAIL_PASSWORD in environment variables
- If using Gmail, verify App Password is correct
- Check spam folder

### Database errors
- Vercel SQLite persists between deployments
- If you need to reset, delete `jazz_xata.db` from your project

---

## Next Steps (Phase 2)

When ready, we'll add:
- Booking.com calendar sync
- Airbnb calendar sync
- Admin dashboard
- Advanced reporting

---

## Support

Contact: hello@jazzxata.com

For issues with Stripe: [stripe.com/support](https://stripe.com/support)
For Vercel help: [vercel.com/support](https://vercel.com/support)
