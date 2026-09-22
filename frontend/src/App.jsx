import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import Movies from './pages/Movies';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import Ticket from './pages/Ticket';

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/login' : '/register';
    const body = authMode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
      } else {
        setAuthError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setAuthError('Network error. Please try again later.');
    }
  };

  if (!user) {
    return (
      <div 
        className="min-h-screen bg-black flex flex-col selection:bg-[#E50914] selection:text-white font-sans relative"
        style={{
          backgroundImage: "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.8) 100%), url('/assets/hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'multiply'
        }}
      >
        <Toaster toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        
        <div className="px-8 py-6">
          <span className="text-[#E50914] text-4xl font-bold tracking-tighter uppercase">Cineflix</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-black/80 p-12 rounded-lg w-full max-w-[450px]">
            <h1 className="text-3xl font-bold text-white mb-8">{authMode === 'login' ? 'Sign In' : 'Sign Up'}</h1>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#333] rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
                    required 
                  />
                </div>
              )}
              <div>
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full bg-[#333] rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
                  required 
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full bg-[#333] rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
                  required 
                />
              </div>
              
              {authError && (
                <div className="text-[#e87c03] text-sm mt-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 8 4Zm0 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-[#E50914] hover:bg-[#f40612] text-white font-bold py-3 rounded transition-colors mt-8"
              >
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <p className="text-gray-400 mt-12 text-sm">
              {authMode === 'login' ? "New to Cineflix? " : "Already subscribed? "}
              <button 
                className="text-white hover:underline font-medium"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
              >
                {authMode === 'login' ? 'Sign up now.' : 'Sign in.'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#141414] text-gray-300 font-sans selection:bg-[#E50914] selection:text-white">
        <Toaster toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5 bg-black sticky top-0 z-50 shadow-md print:hidden">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-[#E50914] text-3xl font-bold tracking-tighter uppercase">
              Cineflix
            </Link>
            <div className="hidden md:flex gap-4 text-sm font-medium">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              <Link to="/tickets" className="hover:text-gray-300 transition-colors">My Tickets</Link>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <span>{user.name}</span>
            <button onClick={() => {
              setUser(null);
              toast('Signed out successfully', { icon: '👋' });
            }} className="hover:text-white transition-colors cursor-pointer">
              Sign out
            </button>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Movies />} />
          <Route path="/movie/:movieId/shows/:showId/seats" element={<SeatSelection user={user} />} />
          <Route path="/checkout/:bookingId" element={<Checkout user={user} />} />
          <Route path="/tickets" element={<MyTickets user={user} />} />
          <Route path="/ticket/:bookingId" element={<Ticket user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
