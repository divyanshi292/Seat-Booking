import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SeatSelection({ user }) {
  const { movieId, showId } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await fetch(`${import.meta.env.VITE_API_URL}/movies/${movieId}`);
        const movieData = await movieRes.json();
        setMovie(movieData);

        const currentShow = movieData.Shows?.find(s => s.id === parseInt(showId));
        setShow(currentShow);

        const seatsRes = await fetch(`${import.meta.env.VITE_API_URL}/shows/${showId}/seats`);
        const seatsData = await seatsRes.json();
        setSeats(seatsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId, showId]);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      toast.error('Please sign in to book seats.');
      return;
    }

    const amount = (selectedSeats.length * parseFloat(show.price_per_seat)) + 30.00;

    const holdPromise = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hold-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatIds: selectedSeats,
          totalAmount: amount,
          userId: user.id,
          showId: show.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to hold seats');

      // Navigate to checkout with the bookingId
      navigate(`/checkout/${data.bookingId}`, { 
        state: { expiresAt: data.heldUntil } 
      });
      return 'Seats held for 5 minutes!';
    };

    toast.promise(holdPromise(), {
      loading: 'Securing your seats...',
      success: (msg) => msg,
      error: (err) => err.message,
    });
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center text-white">Loading Seats...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-16">
      
      {/* Left Section - Seat Map */}
      <div className="flex-1">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-1">Select Seats</h2>
          <p className="text-gray-400 text-sm">
            {localStorage.getItem('selectedCinema') || 'PVR Cinemas'}, {localStorage.getItem('selectedCity') || 'Mumbai'} • {show ? new Date(show.show_time).toLocaleString() : ''}
          </p>
        </div>
        
        {/* Screen */}
        <div className="flex flex-col items-center mt-8 mb-12">
          <div className="w-full max-w-xl h-2 bg-gradient-to-b from-[#E50914] to-transparent rounded-t-[50%] opacity-80 shadow-[0_-10px_30px_rgba(229,9,20,0.5)]"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-6 font-bold">Screen</p>
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-8 gap-x-3 gap-y-4 max-w-xl mx-auto">
          {seats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.id);
            const isOccupied = seat.status === 'BOOKED' || seat.status === 'HELD';
            
            return (
              <button
                key={seat.id}
                disabled={isOccupied}
                onClick={() => toggleSeat(seat.id)}
                title={seat.seat_number}
                className={`
                  relative w-full aspect-square max-w-[48px] rounded-t-xl rounded-b-md transition-all duration-300 flex items-center justify-center text-xs font-bold
                  ${isOccupied 
                    ? 'bg-[#333] text-gray-600 cursor-not-allowed border-t-[3px] border-[#222]' 
                    : isSelected 
                      ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.6)] transform scale-110 border-t-[3px] border-[#ff2f3a] z-10' 
                      : 'bg-[#2b2b2b] text-gray-400 hover:bg-gray-400 hover:text-black hover:-translate-y-1 border-t-[3px] border-[#444]'
                  }
                `}
              >
                {seat.seat_number.replace('S', '')}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-12 border-t border-[#333] pt-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#2b2b2b] border-t-[3px] border-[#444]"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#E50914] border-t-[3px] border-[#ff2f3a]"></div>
            <span className="text-xs font-medium text-white uppercase tracking-wider">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#333] border-t-[3px] border-[#222]"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied / Held</span>
          </div>
        </div>
      </div>

      {/* Right Section - Summary */}
      <div className="w-full md:w-80 shrink-0">
        <div className="bg-[#181818] rounded-md p-8 sticky top-24 border border-[#333]">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Booking Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tickets ({selectedSeats.length})</span>
              <span className="text-white font-medium">₹{(selectedSeats.length * (show ? parseFloat(show.price_per_seat) : 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Convenience Fee</span>
              <span className="text-white font-medium">₹{(selectedSeats.length > 0 ? 30.00 : 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t border-[#333] pt-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-3xl font-bold text-[#E50914]">
                ₹{selectedSeats.length > 0 ? ((selectedSeats.length * parseFloat(show.price_per_seat)) + 30.00).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleHoldSeats}
            disabled={selectedSeats.length === 0}
            className={`
              w-full py-4 rounded text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2
              ${selectedSeats.length > 0 
                ? 'bg-[#E50914] hover:bg-[#f40612] text-white' 
                : 'bg-[#333] text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Proceed to Checkout
          </button>
          <p className="text-[10px] text-gray-500 text-center mt-4">Seats will be held for 5 minutes during checkout.</p>
        </div>
      </div>

    </div>
  );
}
