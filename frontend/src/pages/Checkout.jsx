import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout({ user }) {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    // Determine expiration time from state or fetch from backend
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}`);
        const data = await res.json();
        setBooking(data);

        // If booking is already confirmed or cancelled, handle it
        if (data.booking_status !== 'HELD') {
          toast.error('This booking is no longer valid or already paid.');
          navigate('/');
        }

        // Calculate time left based on seats' held_until
        if (data.Seats && data.Seats.length > 0) {
          const heldUntil = new Date(data.Seats[0].held_until).getTime();
          const now = new Date().getTime();
          const diffSeconds = Math.floor((heldUntil - now) / 1000);
          
          if (diffSeconds > 0) {
            setTimeLeft(diffSeconds);
          } else {
            toast.error('Session expired. Seats have been released.');
            navigate('/');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('Time expired! Seats have been released.');
      navigate('/'); // Redirect to home on expire
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return;

    const paymentPromise = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          userId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      
      navigate(`/ticket/${bookingId}`);
      return 'Payment successful! Tickets booked.';
    };

    toast.promise(paymentPromise(), {
      loading: 'Processing payment...',
      success: (msg) => msg,
      error: (err) => err.message,
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!booking) return <div className="min-h-[60vh] flex justify-center items-center text-white">Loading Checkout...</div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-12">
      {/* Left: Payment Form */}
      <div className="flex-1 bg-[#181818] p-8 rounded-lg border border-[#333]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Payment Details</h2>
          <div className="bg-[#333] px-4 py-2 rounded-full flex items-center gap-2 border border-[#444]">
            <span className="text-gray-400 text-sm">Time left:</span>
            <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-[#E50914] animate-pulse' : 'text-[#46d369]'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Cardholder Name</label>
            <input type="text" required placeholder="John Doe" className="w-full bg-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Card Number</label>
            <input type="text" required placeholder="1234 5678 9101 1121" className="w-full bg-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
              <input type="text" required placeholder="MM/YY" className="w-full bg-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">CVV</label>
              <input type="text" required placeholder="123" className="w-full bg-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#E50914] hover:bg-[#f40612] text-white font-bold py-4 rounded text-lg transition-colors mt-8">
            Pay ₹{parseFloat(booking.total_amount).toFixed(2)}
          </button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="w-full md:w-80 shrink-0">
        <div className="bg-[#181818] p-8 rounded-lg border border-[#333]">
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-[#333] pb-4">Order Summary</h3>
          <div className="mb-6">
            <p className="text-lg text-white font-bold">{booking.Show?.Movie?.title}</p>
            <p className="text-sm text-gray-400 mt-1">{booking.Show ? new Date(booking.Show.show_time).toLocaleString() : ''}</p>
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Seats Selected</p>
            <div className="flex flex-wrap gap-2">
              {booking.Seats?.map(seat => (
                <span key={seat.id} className="bg-[#E50914] text-white px-2 py-1 rounded text-xs font-bold">
                  {seat.seat_number}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-[#333] pt-6 flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <span className="text-2xl font-bold text-[#E50914]">₹{parseFloat(booking.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
