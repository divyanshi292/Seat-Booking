const { connectDB, sequelize } = require('./config/db');
const { Movie, Show, Seat } = require('./models');

const seedDatabase = async () => {
  await connectDB();
  await sequelize.sync({ force: true }); // Reset DB

  console.log('🌱 Seeding database...');

  const movie = await Movie.create({
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse...',
    poster_url: 'https://example.com/spiderman.jpg',
    duration_mins: 140,
  });

  const show = await Show.create({
    movieId: movie.id,
    show_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    price_per_seat: 15.00,
  });

  const seats = [];
  for (let i = 1; i <= 40; i++) {
    seats.push({
      seat_number: `S${i}`,
      is_booked: [5, 6, 15, 16, 22].includes(i), // Book some random seats
      showId: show.id,
    });
  }

  await Seat.bulkCreate(seats);

  console.log('✅ Seeding complete!');
  process.exit();
};

seedDatabase();
