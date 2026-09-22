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

  const getSeatTier = (seat) => {
    const num = parseInt(seat.seat_number.replace('S', ''));
    if (num <= 16) return { name: 'Silver', extraPrice: 0, bg: 'bg-[#2b2b2b]', border: 'border-[#444]', hover: 'hover:bg-gray-400 hover:border-gray-500' };
    if (num <= 32) return { name: 'Gold', extraPrice: 100, bg: 'bg-[#7a6021]', border: 'border-[#a3802c]', hover: 'hover:bg-[#a3802c] hover:border-[#c79c36]' };
    return { name: 'Recliner', extraPrice: 250, bg: 'bg-[#1a365d]', border: 'border-[#2c5282]', hover: 'hover:bg-[#2c5282] hover:border-[#4299e1]' };
  };

  const calculateTicketsTotal = () => {
    if (selectedSeats.length === 0 || !show) return 0;
    const basePrice = parseFloat(show.price_per_seat);
    let total = 0;
    selectedSeats.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        total += basePrice + getSeatTier(seat).extraPrice;
      }
    });
    return total;
  };

  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      toast.error('Please sign in to book seats.');
      return;
    }

    const ticketsTotal = calculateTicketsTotal();
    const amount = ticketsTotal + 30.00;

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

  const ticketsTotal = calculateTicketsTotal();
  const grandTotal = selectedSeats.length > 0 ? ticketsTotal + 30.00 : 0;

  // Group seats by tier for rendering
  const silverSeats = seats.filter(s => parseInt(s.seat_number.replace('S', '')) <= 16);
  const goldSeats = seats.filter(s => { const n = parseInt(s.seat_number.replace('S', '')); return n > 16 && n <= 32; });
  const reclinerSeats = seats.filter(s => parseInt(s.seat_number.replace('S', '')) > 32);

  const renderSeatGrid = (seatGroup, title, basePrice, extraPrice) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
        <span>{title}</span>
        <span>₹{basePrice + extraPrice}</span>
      </div>
      <div className="grid grid-cols-8 gap-x-3 gap-y-4 max-w-xl mx-auto">
        {seatGroup.map((seat) => {
          const isSelected = selectedSeats.includes(seat.id);
          const isOccupied = seat.status === 'BOOKED' || seat.status === 'HELD';
          const tierInfo = getSeatTier(seat);
          
          return (
            <button
              key={seat.id}
              disabled={isOccupied}
              onClick={() => toggleSeat(seat.id)}
              title={`${seat.seat_number} - ₹${basePrice + extraPrice}`}
              className={`
                relative w-full aspect-square max-w-[48px] rounded-t-xl rounded-b-md transition-all duration-300 flex items-center justify-center text-xs font-bold
                ${isOccupied 
                  ? 'bg-[#333] text-gray-600 cursor-not-allowed border-t-[3px] border-[#222]' 
                  : isSelected 
                    ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.6)] transform scale-110 border-t-[3px] border-[#ff2f3a] z-10' 
                    : `${tierInfo.bg} text-gray-300 ${tierInfo.hover} hover:text-white hover:-translate-y-1 border-t-[3px] ${tierInfo.border}`
                }
              `}
            >
              {seat.seat_number.replace('S', '')}
            </button>
          )
        })}
      </div>
    </div>
  );

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
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-6 font-bold mb-12">Screen</p>
        </div>

        {/* Seat Grids */}
        {renderSeatGrid(silverSeats, 'Silver (Rows A-B)', show ? parseFloat(show.price_per_seat) : 0, 0)}
        {renderSeatGrid(goldSeats, 'Gold (Rows C-D)', show ? parseFloat(show.price_per_seat) : 0, 100)}
        {renderSeatGrid(reclinerSeats, 'Recliner (Row E)', show ? parseFloat(show.price_per_seat) : 0, 250)}

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-12 border-t border-[#333] pt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#2b2b2b] border-t-[3px] border-[#444]"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Silver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#7a6021] border-t-[3px] border-[#a3802c]"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Gold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#1a365d] border-t-[3px] border-[#2c5282]"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recliner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#E50914] border-t-[3px] border-[#ff2f3a]"></div>
            <span className="text-xs font-medium text-white uppercase tracking-wider">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-lg bg-[#333] border-t-[3px] border-[#222]"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</span>
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
              <span className="text-white font-medium">₹{ticketsTotal.toFixed(2)}</span>
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
                ₹{grandTotal.toFixed(2)}
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
