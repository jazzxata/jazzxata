# 🚀 Jazz Xata Deployment Checklist

Use this checklist before going live to ensure everything is perfect.

---

## ✅ Pre-Launch Checklist

### Content & Design
- [ ] Update cottage photos in gallery (index.html lines 698-712)
- [ ] Replace sample reviews with real guest reviews
- [ ] Update OWNER_EMAIL with your actual email
- [ ] Change admin password (server.js line 406)
- [ ] Review all text for typos
- [ ] Test language toggle (EN/УК)
- [ ] Verify rustic design looks good on your device

### Functionality
- [ ] Test date selection on desktop
- [ ] Test date selection on mobile
- [ ] Test booking form validation
- [ ] Test payment with test card locally
- [ ] Verify confirmation email arrives
- [ ] Verify owner notification email arrives
- [ ] Test admin panel login
- [ ] Test blocking dates in admin panel
- [ ] Check calendar updates after blocking dates

### API & Integrations
- [ ] Stripe test payment succeeds
- [ ] MongoDB has real data (test booking)
- [ ] Email service sends confirmation emails
- [ ] All error messages are clear

### Security
- [ ] No test API keys in production
- [ ] Admin password is strong and changed
- [ ] .env file is NOT in git (check .gitignore)
- [ ] Sensitive data is not logged
- [ ] HTTPS will be enabled on Vercel

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Images are optimized
- [ ] Calendar is responsive (no lag when clicking dates)
- [ ] Payment form loads quickly

---

## 🔑 Keys & Configuration

### Before Deploying
- [ ] Get Stripe **production** keys (not test keys!)
  - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
  - Switch from "Test mode" to "Live mode"
  - Copy live keys (start with `pk_live_` and `sk_live_`)

- [ ] Update production Stripe keys in Vercel environment variables

- [ ] Update `STRIPE_PUBLISHABLE_KEY` in `index.html` (line 959)

- [ ] Update `API_BASE` in `index.html` (line 958) to your Vercel URL:
  ```javascript
  const API_BASE = 'https://jazz-xata.vercel.app/api';
  ```

### MongoDB
- [ ] MongoDB Atlas cluster is production-ready
- [ ] Database user has strong password
- [ ] IP whitelist includes Vercel IPs (or set to 0.0.0.0)

### Email
- [ ] Email account credentials are correct
- [ ] OWNER_EMAIL is set to real email
- [ ] Test email was received

---

## 📋 Vercel Deployment

### Setup
- [ ] GitHub account created
- [ ] Code pushed to GitHub (`main` branch)
- [ ] Vercel account created
- [ ] Project connected to GitHub repo
- [ ] Environment variables added to Vercel

### Verification
- [ ] Deployment completed successfully
- [ ] Site loads at vercel.app URL
- [ ] Home page displays correctly
- [ ] Calendar loads (no database errors)
- [ ] Payment button is functional
- [ ] Booking form submits successfully
- [ ] Admin panel is accessible

### Post-Deploy
- [ ] Test payment with production Stripe keys
- [ ] Verify confirmation email arrives
- [ ] Check Stripe dashboard for successful transaction
- [ ] Test on mobile devices
- [ ] Test language toggle on production

---

## 🧪 Final Testing (Production)

### Full User Journey
1. [ ] Visit site on production URL
2. [ ] Select dates on calendar
3. [ ] Enter guest details
4. [ ] Complete payment with real card (not test)
5. [ ] Receive confirmation email
6. [ ] Check Stripe dashboard for payment
7. [ ] Check admin panel for booking
8. [ ] Switch to Ukrainian and repeat

### Edge Cases
- [ ] Try booking with invalid email
- [ ] Try selecting past dates (should be disabled)
- [ ] Try selecting unavailable dates
- [ ] Try payment with expired card (should fail)
- [ ] Try payment with invalid CVC
- [ ] Mobile: check form doesn't overflow
- [ ] Mobile: check calendar is usable
- [ ] Mobile: check payment form is readable

---

## 📣 Launch

### Before Announcement
- [ ] All tests pass ✅
- [ ] Backup production database
- [ ] Set up monitoring (optional: Vercel has built-in)
- [ ] Create first real booking to test end-to-end

### Announce
- [ ] Send booking link to friends/family
- [ ] Post on social media
- [ ] Add to your accommodation listing sites
- [ ] Request initial reviews from real guests

### Monitor First Week
- [ ] Check bookings daily
- [ ] Respond to booking inquiries
- [ ] Monitor error logs
- [ ] Check Stripe transactions
- [ ] Verify emails are sending

---

## 🔄 Maintenance (Ongoing)

### Weekly
- [ ] Check for new bookings
- [ ] Respond to guest inquiries
- [ ] Review guest reviews

### Monthly
- [ ] Review analytics (Vercel)
- [ ] Check Stripe transactions
- [ ] Update blocked dates as needed
- [ ] Backup database

### Quarterly
- [ ] Update photos/descriptions
- [ ] Review pricing seasonality
- [ ] Add new guest reviews
- [ ] Check for security updates

---

## 🆘 If Something Goes Wrong

### Can't access Vercel site
- Check GitHub repo is synced
- Check Vercel deployment logs
- Verify all environment variables are set
- Try redeploying

### Payment not working
- Check Stripe keys are production keys (not test)
- Check key in `index.html` matches Vercel env vars
- Check Stripe account is activated
- Test with test card first

### Emails not sending
- Check OWNER_EMAIL is correct
- Check email credentials are correct
- Verify SMTP is working with test email
- Check spam folder
- Check email service isn't blocking Vercel IP

### Database errors
- Check MONGODB_URI is correct
- Check MongoDB Atlas whitelist includes Vercel IPs
- Check database user credentials
- Try restarting MongoDB cluster

---

## 📞 Need Help?

- **Stripe Issues:** [stripe.com/support](https://stripe.com/support)
- **MongoDB Issues:** [mongodb.com/support](https://mongodb.com/support)
- **Vercel Issues:** [vercel.com/support](https://vercel.com/support)

---

**Once you check all boxes, you're ready to accept real bookings! 🎉**
