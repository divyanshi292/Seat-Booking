const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Movie, Show, Seat, Booking, BookingSeat } = require('../models');

const router = express.Router();

// --- AUTH ROUTES ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password_hash });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CORE ROUTES ---

router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [Show]
    });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [Show]
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Seats for a specific Show (Dynamic release of expired holds)
router.get('/shows/:id/seats', async (req, res) => {
  try {
    const seats = await Seat.findAll({
      where: { showId: req.params.id },
      order: [['id', 'ASC']]
    });

    const now = new Date();
    
    // Auto-release expired holds before sending to client
    const updatedSeats = await Promise.all(seats.map(async (seat) => {
      if (seat.status === 'HELD' && seat.held_until && seat.held_until < now) {
        seat.status = 'AVAILABLE';
        seat.held_until = null;
        await seat.save();
      }
      return seat;
    }));

    res.json(updatedSeats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hold Seats
router.post('/hold-seats', async (req, res) => {
  const { seatIds, totalAmount, userId, showId } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Check if seats are still available (not BOOKED, and not HELD by someone else currently)
    const seats = await Seat.findAll({ where: { id: seatIds } });
    const now = new Date();
    
    for (const seat of seats) {
      if (seat.status === 'BOOKED' || (seat.status === 'HELD' && seat.held_until > now)) {
        return res.status(400).json({ error: 'One or more seats are no longer available.' });
      }
    }

    // 2. Create Booking as 'HELD'
    const booking = await Booking.create({
      total_amount: totalAmount,
      booking_status: 'HELD',
      userId,
      showId
    });

    // 3. Mark seats as HELD with expiration
    const heldUntil = new Date(now.getTime() + 5 * 60000); // 5 mins from now
    await Seat.update(
      { status: 'HELD', held_until: heldUntil },
      { where: { id: seatIds } }
    );

    // Link booking and seats
    for (const seatId of seatIds) {
      await BookingSeat.create({ BookingId: booking.id, SeatId: seatId });
    }

    res.json({ message: 'Seats held successfully', bookingId: booking.id, heldUntil });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm Booking (Payment step)
router.post('/book', async (req, res) => {
  const { bookingId, userId } = req.body;

  try {
    const booking = await Booking.findOne({ 
      where: { id: bookingId, userId },
      include: [Seat]
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.booking_status === 'CONFIRMED') return res.status(400).json({ error: 'Already confirmed' });

    // Check if hold expired
    const now = new Date();
    const seats = booking.Seats;
    
    if (seats.length > 0 && seats[0].held_until < now) {
      // Hold expired, release seats and fail booking
      await Seat.update({ status: 'AVAILABLE', held_until: null }, { where: { id: seats.map(s => s.id) } });
      await booking.update({ booking_status: 'CANCELLED' });
      return res.status(400).json({ error: 'Hold expired. Please select seats again.' });
    }

    // Confirm booking and lock seats
    await booking.update({ booking_status: 'CONFIRMED' });
    await Seat.update({ status: 'BOOKED', held_until: null }, { where: { id: seats.map(s => s.id) } });

    res.json({ message: 'Booking confirmed successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Booking details
router.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [Seat, Show]
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Bookings
router.get('/user/:userId/bookings', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.params.userId },
      include: [
        { model: Seat },
        { 
          model: Show, 
          include: [Movie] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
