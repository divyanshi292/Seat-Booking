import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [region, setRegion] = useState(localStorage.getItem('selectedCity') || 'Mumbai');
  const [cinema, setCinema] = useState(localStorage.getItem('selectedCinema') || 'PVR Cinemas');

  useEffect(() => {
    localStorage.setItem('selectedCity', region);
    localStorage.setItem('selectedCinema', cinema);
  }, [region, cinema]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/movies`);
        const data = await res.json();
        setMovies(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex justify-center items-center">Loading...</div>;

  return (
    <div className="pb-20">
      
      {/* Location / Cinema Selector */}
      <div className="bg-[#181818] border-b border-[#333] px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 uppercase font-bold mb-1">Region</label>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="bg-[#333] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 uppercase font-bold mb-1">Cinema</label>
            <select 
              value={cinema} 
              onChange={(e) => setCinema(e.target.value)}
              className="bg-[#333] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
            >
              <option value="PVR Cinemas">PVR Cinemas</option>
              <option value="INOX">INOX</option>
              <option value="Cinepolis">Cinepolis</option>
            </select>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 px-8 mt-8">Now Showing</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 px-8">
        {movies.map(movie => (
          <div key={movie.id} className="group relative cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10">
            <img 
              src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'} 
              alt={movie.title}
              className="w-full h-72 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
              <h3 className="text-white font-bold text-lg leading-tight mb-2">{movie.title}</h3>
              {movie.Shows && movie.Shows.length > 0 ? (
                <button 
                  onClick={() => navigate(`/movie/${movie.id}/shows/${movie.Shows[0].id}/seats`)}
                  className="bg-[#E50914] text-white text-xs font-bold py-2 rounded"
                >
                  Book Tickets
                </button>
              ) : (
                <span className="text-gray-400 text-xs">No shows available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
