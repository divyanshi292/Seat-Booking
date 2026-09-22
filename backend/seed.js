require('dotenv').config();
const { sequelize } = require('./config/db');
const { Movie, Show, Seat } = require('./models');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create Movies
    const movies = await Movie.bulkCreate([
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        duration_mins: 140,
        poster_url: '/assets/spiderman.jpg',
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        duration_mins: 166,
        poster_url: '/assets/dune.jpg',
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        duration_mins: 180,
        poster_url: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      },
      {
        title: 'The Batman',
        description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
        duration_mins: 176,
        poster_url: 'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        duration_mins: 169,
        poster_url: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        duration_mins: 148,
        poster_url: '/assets/inception.jpg',
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        duration_mins: 192,
        poster_url: '/assets/avatar.jpg',
      }
    ]);

    // Create Shows and Seats for each movie
    for (const movie of movies) {
      // Create a show
      const show = await Show.create({
        show_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        price_per_seat: 250.00,
        movieId: movie.id,
      });

      // Create 40 seats for this show
      const seats = [];
      for (let i = 1; i <= 40; i++) {
        // Randomly book a few seats for realistic display
        const randomBooking = Math.random() < 0.2; 
        seats.push({
          seat_number: `S${i}`,
          status: randomBooking ? 'BOOKED' : 'AVAILABLE',
          showId: show.id,
        });
      }
      await Seat.bulkCreate(seats);
    }

    console.log('🌱 Seeding complete! Added 5 movies with shows and seats.');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedDatabase();
