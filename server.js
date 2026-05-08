const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin.html
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jazz_xata';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Define Mongoose Schemas
const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: String,
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  numGuests: { type: Number, required: true },
  specialRequests: String,
  totalPrice: { type: Number, required: true },
  stripePaymentId: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const blockedDateSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
const BlockedDate = mongoose.model('BlockedDate', blockedDateSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// ============ PRICING CONFIGURATION ============
const pricingSeasons = [
  { months: [11, 12, 1, 2, 3], pricePerNight: 80 },  // Low season
  { months: [4, 10], pricePerNight: 120 },            // Mid season
  { months: [5, 6, 7, 8, 9], pricePerNight: 180 }    // High season
];

// ============ HELPER FUNCTIONS ============
function getSeason(month) {
  for (let season of pricingSeasons) {
    if (season.months.includes(month)) {
      return season;
    }
  }
  return pricingSeasons[0];
}

function calculatePrice(checkInDate, checkOutDate) {
  let totalPrice = 0;
  let currentDate = new Date(checkInDate);

  while (currentDate < checkOutDate) {
    const month = currentDate.getMonth() + 1;
    const season = getSeason(month);
    totalPrice += season.pricePerNight;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalPrice;
}

function sendConfirmationEmail(booking) {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  const guestEmailContent = `
Dear ${booking.guestName},

Thank you for booking Jazz Xata! We're excited to host you.

Booking Details:
- Check-in: ${booking.checkIn}
- Check-out: ${booking.checkOut}
- Number of guests: ${booking.numGuests}
- Nights: ${nights}
- Total price: €${booking.totalPrice}
${booking.specialRequests ? `- Special requests: ${booking.specialRequests}` : ''}

We'll be in touch shortly with more information about your arrival.

Warm regards,
Jazz Xata Team
  `.trim();

  const ownerEmailContent = `
New Booking Request!

Guest: ${booking.guestName}
Email: ${booking.guestEmail}
Phone: ${booking.guestPhone || 'Not provided'}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}
Guests: ${booking.numGuests}
Total: €${booking.totalPrice}
Special Requests: ${booking.specialRequests || 'None'}

Status: ${booking.status}
Payment ID: ${booking.stripePaymentId || 'Pending'}
  `.trim();

  // Send to guest
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.guestEmail,
    subject: 'Booking Confirmation - Jazz Xata',
    text: guestEmailContent
  }, (err) => {
    if (err) console.error('Error sending guest email:', err);
  });

  // Send to owner
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: `New Booking: ${booking.guestName}`,
    text: ownerEmailContent
  }, (err) => {
    if (err) console.error('Error sending owner email:', err);
  });
}

// ============ API ROUTES ============

// Get availability for a date range
app.get('/api/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates required' });
    }

    // Get all booked dates
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });

    // Get blocked dates
    const blockedDates = await BlockedDate.find();

    const unavailableDates = [];

    // Add booked date ranges
    bookings.forEach(booking => {
      let currentDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);

      while (currentDate < checkOutDate) {
        unavailableDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Add manually blocked dates
    blockedDates.forEach(bd => {
      unavailableDates.push(bd.date);
    });

    res.json({
      available: true,
      unavailableDates: [...new Set(unavailableDates)]
    });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a booking (initiate payment)
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      numGuests,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!guestName || !guestEmail || !checkIn || !checkOut || !numGuests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate minimum stay (2 nights)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights < 2) {
      return res.status(400).json({ error: 'Minimum 2 nights required' });
    }

    // Calculate price
    const totalPrice = calculatePrice(checkInDate, checkOutDate);

    // Create Stripe payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        numGuests
      }
    });

    // Store booking in database (pending status)
    const booking = new Booking({
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      numGuests,
      specialRequests,
      totalPrice,
      stripePaymentId: paymentIntent.id,
      status: 'pending'
    });

    const savedBooking = await booking.save();

    res.json({
      success: true,
      bookingId: savedBooking._id,
      clientSecret: paymentIntent.client_secret,
      totalPrice
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment and complete booking
app.post('/api/bookings/confirm', async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // Verify payment was successful
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update booking status to confirmed
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true }
    );

    if (booking) {
      sendConfirmationEmail(booking);
    }

    res.json({ success: true, message: 'Booking confirmed!' });
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (admin endpoint - should be protected)
app.get('/api/bookings', async (req, res) => {
  try {
    const adminToken = req.headers.authorization;

    if (adminToken !== `Bearer ${'admin-secret-token-12345'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Block a date (admin endpoint)
app.post('/api/blocked-dates', async (req, res) => {
  try {
    const { date, reason } = req.body;
    console.log('📅 Block date request:', date);

    if (!date) {
      console.log('❌ No date provided');
      return res.status(400).json({ error: 'Date required' });
    }

    console.log('🔄 Inserting into database...');
    const blockedDate = new BlockedDate({
      date,
      reason: reason || null
    });

    await blockedDate.save();
    console.log('✅ Date blocked successfully:', date);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Database error:', error.message);
    res.status(500).json({ error: 'Failed to block date: ' + error.message });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = 'jazzxata1';
  const adminToken = 'admin-secret-token-12345';

  if (password === adminPassword) {
    res.json({ success: true, token: adminToken });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all blocked dates
app.get('/api/admin/blocked-dates', async (req, res) => {
  try {
    const dates = await BlockedDate.find().sort({ date: 1 });
    res.json(dates || []);
  } catch (error) {
    console.error('Fetch blocked dates error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete blocked date
app.delete('/api/admin/blocked-dates/:id', async (req, res) => {
  try {
    await BlockedDate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete blocked date error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update booking status
app.put('/api/admin/bookings/:id', async (req, res) => {
  try {
    const adminToken = req.headers.authorization;
    if (adminToken !== `Bearer ${'admin-secret-token-12345'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status } = req.body;
    await Booking.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Jazz Xata booking server running on port ${PORT}`);
});

module.exports = app;
