import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyTickets({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${user.id}/bookings`);
        const data = await res.json();
        setBookings(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex justify-center items-center">Loading Tickets...</div>;

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wider">My Tickets</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#181818] rounded-lg border border-[#333]">
          <p className="text-gray-400 mb-4 text-lg">You haven't booked any tickets yet.</p>
          <Link to="/" className="bg-[#E50914] text-white px-6 py-2 rounded font-bold hover:bg-[#f40612] transition-colors">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isConfirmed = booking.booking_status === 'CONFIRMED';
            const statusColor = isConfirmed ? 'text-[#46d369]' : 'text-orange-500';

            return (
              <div key={booking.id} className="bg-[#181818] rounded-lg border border-[#333] flex overflow-hidden">
                <div className="w-1/3 shrink-0">
                  <img 
                    src={booking.Show?.Movie?.poster_url || 'https://via.placeholder.com/150x225?text=No+Poster'} 
                    alt="Movie Poster" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {booking.Show?.Movie?.title || 'Unknown Movie'}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-1 bg-[#333] rounded ${statusColor}`}>
                        {booking.booking_status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      {booking.Show ? new Date(booking.Show.show_time).toLocaleString() : 'N/A'}
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-xs text-gray-500 uppercase">Seats</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {booking.Seats?.map(seat => (
                          <span key={seat.id} className="bg-[#E50914] text-white px-2 py-1 rounded text-xs font-bold">
                            {seat.seat_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#333] pt-4 flex justify-between items-end">
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Order Total</span>
                      <p className="text-lg font-bold text-white">₹{parseFloat(booking.total_amount).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase">Booking ID</span>
                      <p className="text-sm font-mono text-gray-400">#{booking.id.toString().padStart(6, '0')}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
