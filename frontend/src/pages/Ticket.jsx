import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Ticket({ user }) {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}`);
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (!booking) return <div className="min-h-screen flex justify-center items-center text-white">Loading Ticket...</div>;

  const cinemaName = localStorage.getItem('selectedCinema') || 'PVR Cinemas';
  const city = localStorage.getItem('selectedCity') || 'Mumbai';

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wider">Your E-Ticket</h2>

      {/* Ticket Container */}
      <div className="bg-white text-black w-full rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Left Side: Poster */}
        <div className="w-full md:w-1/3 bg-gray-200">
          <img 
            src={booking.Show?.Movie?.poster_url || 'https://via.placeholder.com/300x450'} 
            alt="Movie" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Details */}
        <div className="p-8 flex-1 border-l-2 border-dashed border-gray-400 relative">
          {/* Top/Bottom cutouts for realistic ticket look */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#141414] rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-[#141414] rounded-full"></div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-black uppercase leading-tight">{booking.Show?.Movie?.title}</h3>
              <p className="text-gray-600 font-bold mt-1">{cinemaName}, {city}</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase border border-green-300">
              Confirmed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Date & Time</p>
              <p className="font-bold text-lg">{new Date(booking.Show?.show_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Booking ID</p>
              <p className="font-bold text-lg font-mono">#{booking.id.toString().padStart(6, '0')}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Seats ({booking.Seats?.length})</p>
            <div className="flex flex-wrap gap-2">
              {booking.Seats?.map(seat => (
                <span key={seat.id} className="bg-black text-white px-3 py-1 rounded text-sm font-bold">
                  {seat.seat_number}
                </span>
              ))}
            </div>
          </div>

          {/* Fake Barcode */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
            <div className="w-full h-16 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_5px,transparent_5px,transparent_8px,#000_8px,#000_12px)] opacity-80"></div>
            <p className="text-xs text-gray-400 mt-2 font-mono">{user?.id}-{booking.id}-XYZ987</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <button onClick={() => window.print()} className="bg-white text-black px-6 py-3 rounded font-bold hover:bg-gray-200 transition-colors">
          Print Ticket
        </button>
        <Link to="/" className="bg-[#E50914] text-white px-6 py-3 rounded font-bold hover:bg-[#f40612] transition-colors">
          Back to Movies
        </Link>
      </div>
    </div>
  );
}
