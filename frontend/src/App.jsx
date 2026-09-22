import { useState, useEffect } from 'react';

function App() {
  const [movie, setMovie] = useState(null);
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Movies
        const moviesRes = await fetch('http://localhost:5000/api/movies');
        const moviesData = await moviesRes.json();
        
        if (moviesData.length > 0) {
          setMovie(moviesData[0]); // Just pick the first movie for demo
          
          if (moviesData[0].Shows.length > 0) {
            const firstShow = moviesData[0].Shows[0];
            setShow(firstShow);
            
            // Fetch Seats for this show
            const seatsRes = await fetch(`http://localhost:5000/api/shows/${firstShow.id}/seats`);
            const seatsData = await seatsRes.json();
            setSeats(seatsData);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const amount = (selectedSeats.length * parseFloat(show.price_per_seat)) + 2.50;
      
      const res = await fetch('http://localhost:5000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatIds: selectedSeats,
          totalAmount: amount
        })
      });

      if (res.ok) {
        alert('Booking Confirmed! Enjoy the movie.');
        // Refresh seats
        const seatsRes = await fetch(`http://localhost:5000/api/shows/${show.id}/seats`);
        const seatsData = await seatsRes.json();
        setSeats(seatsData);
        setSelectedSeats([]); // clear selection
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert('Failed to book seats.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-rose-500 selection:text-white pb-12">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/20">
            S
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            SeatBooker
          </span>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:text-rose-400 transition-colors">Movies</a>
          <a href="#" className="hover:text-rose-400 transition-colors">Events</a>
          <a href="#" className="hover:text-rose-400 transition-colors">Profile</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Left Section - Seat Map */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{movie ? movie.title : 'No Movie Available'}</h1>
            <p className="text-slate-400">PVR Cinemas, Screen 2 • {show ? new Date(show.show_time).toLocaleString() : ''}</p>
          </div>
          
          {/* Screen curve */}
          <div className="flex flex-col items-center mt-12 mb-8">
            <div className="w-full max-w-md h-12 border-t-4 border-rose-500/30 rounded-t-[50%] blur-[1px]"></div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-semibold">Screen This Way</p>
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-8 gap-3 max-w-lg mx-auto">
            {seats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.id);
              const isOccupied = seat.is_booked;
              
              return (
                <button
                  key={seat.id}
                  disabled={isOccupied}
                  onClick={() => toggleSeat(seat.id)}
                  title={seat.seat_number}
                  className={`
                    w-10 h-10 rounded-t-lg rounded-b-sm border transition-all duration-200 flex items-center justify-center text-xs font-medium
                    ${isOccupied 
                      ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' 
                      : isSelected 
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30 transform scale-110' 
                        : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-rose-400 hover:bg-slate-800 hover:-translate-y-1'
                    }
                  `}
                >
                  {seat.seat_number.replace('S', '')}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-slate-800/50 border border-slate-600"></div>
              <span className="text-xs text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-rose-500 border border-rose-400"></div>
              <span className="text-xs text-slate-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-t bg-slate-800 border border-slate-700"></div>
              <span className="text-xs text-slate-400">Occupied</span>
            </div>
          </div>
        </div>

        {/* Right Section - Checkout */}
        <div className="w-full md:w-80">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sticky top-24 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Tickets ({selectedSeats.length})</span>
                <span className="text-white font-medium">${(selectedSeats.length * (show ? parseFloat(show.price_per_seat) : 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Convenience Fee</span>
                <span className="text-white font-medium">${(selectedSeats.length > 0 ? 2.50 : 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Total</span>
                <span className="text-2xl font-bold text-rose-400">
                  ${selectedSeats.length > 0 ? ((selectedSeats.length * parseFloat(show.price_per_seat)) + 2.50).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
                ${selectedSeats.length > 0 
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transform hover:-translate-y-1' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;
