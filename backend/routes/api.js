const express = require('express');
const { Movie, Show, Seat, Booking, BookingSeat } = require('../models');

const router = express.Router();

// Get Movies with their Shows
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

// Get Seats for a specific Show
router.get('/shows/:id/seats', async (req, res) => {
  try {
    const seats = await Seat.findAll({
      where: { showId: req.params.id },
      order: [['id', 'ASC']]
    });
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book Seats
router.post('/book', async (req, res) => {
  const { seatIds, totalAmount } = req.body;
  // Normally you'd get userId from Auth token, hardcoding for demo
  const userId = 1; 

  try {
    // 1. Create Booking
    const booking = await Booking.create({
      total_amount: totalAmount,
      booking_status: 'CONFIRMED',
      userId // Optional, if user exists
    });

    // 2. Mark seats as booked
    await Seat.update(
      { is_booked: true },
      { where: { id: seatIds } }
    );

    res.json({ message: 'Booking successful', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
