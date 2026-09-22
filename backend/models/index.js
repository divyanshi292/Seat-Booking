const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

const Movie = sequelize.define('Movie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  poster_url: { type: DataTypes.STRING },
  duration_mins: { type: DataTypes.INTEGER },
}, { timestamps: true });

const Show = sequelize.define('Show', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  show_time: { type: DataTypes.DATE, allowNull: false },
  price_per_seat: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { timestamps: true });

const Seat = sequelize.define('Seat', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seat_number: { type: DataTypes.STRING, allowNull: false },
  is_booked: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  booking_status: { type: DataTypes.STRING, defaultValue: 'PENDING' }, // PENDING, CONFIRMED
}, { timestamps: true });

// Define Relationships
Movie.hasMany(Show, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Show.belongsTo(Movie, { foreignKey: 'movieId' });

Show.hasMany(Seat, { foreignKey: 'showId', onDelete: 'CASCADE' });
Seat.belongsTo(Show, { foreignKey: 'showId' });

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Show.hasMany(Booking, { foreignKey: 'showId' });
Booking.belongsTo(Show, { foreignKey: 'showId' });

// Bookings <-> Seats (Many to Many)
const BookingSeat = sequelize.define('BookingSeat', {}, { timestamps: false });
Booking.belongsToMany(Seat, { through: BookingSeat });
Seat.belongsToMany(Booking, { through: BookingSeat });

module.exports = {
  User,
  Movie,
  Show,
  Seat,
  Booking,
  BookingSeat
};
