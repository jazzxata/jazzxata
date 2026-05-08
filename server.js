const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
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

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Database
const dbPath = path.join(__dirname, 'jazz_xata.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guestName TEXT NOT NULL,
      guestEmail TEXT NOT NULL,
      guestPhone TEXT,
      checkIn TEXT NOT NULL,
      checkOut TEXT NOT NULL,
      numGuests INTEGER NOT NULL,
      specialRequests TEXT,
      totalPrice REAL NOT NULL,
      stripePaymentId TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

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
app.get('/api/availability', (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut dates required' });
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  // Get all booked dates
  db.all(
    `SELECT checkIn, checkOut FROM bookings WHERE status != 'cancelled'`,
    (err, bookings) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Get blocked dates
      db.all(`SELECT date FROM blocked_dates`, (err, blockedDates) => {
        if (err) return res.status(500).json({ error: 'Database error' });

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
      });
    }
  );
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
    db.run(
      `INSERT INTO bookings (guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, specialRequests, totalPrice, stripePaymentId, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, specialRequests, totalPrice, paymentIntent.id, 'pending'],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create booking' });
        }

        res.json({
          success: true,
          bookingId: this.lastID,
          clientSecret: paymentIntent.client_secret,
          totalPrice
        });
      }
    );
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment and complete booking
app.post('/api/bookings/confirm', (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // Verify payment was successful
    stripeClient.paymentIntents.retrieve(paymentIntentId, (err, paymentIntent) => {
      if (err) return res.status(500).json({ error: 'Payment verification failed' });

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // Update booking status to confirmed
      db.run(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        ['confirmed', bookingId],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to confirm booking' });

          // Get booking details and send confirmation email
          db.get(`SELECT * FROM bookings WHERE id = ?`, [bookingId], (err, booking) => {
            if (booking) {
              sendConfirmationEmail(booking);
            }
          });

          res.json({ success: true, message: 'Booking confirmed!' });
        }
      );
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (admin endpoint - should be protected)
app.get('/api/bookings', (req, res) => {
  const adminToken = req.headers.authorization;

  if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all(`SELECT * FROM bookings ORDER BY createdAt DESC`, (err, bookings) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(bookings);
  });
});

// Block a date (admin endpoint)
app.post('/api/blocked-dates', (req, res) => {
  const adminToken = req.headers.authorization;

  if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { date, reason } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date required' });
  }

  db.run(
    `INSERT INTO blocked_dates (date, reason) VALUES (?, ?)`,
    [date, reason || null],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to block date' });
      res.json({ success: true });
    }
  );
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
