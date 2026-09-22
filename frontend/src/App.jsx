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
  const [showPassword, setShowPassword] = useState(false);

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
        if (authMode === 'register') {
          toast.success(`Welcome, ${data.user.name}!`);
        } else {
          toast.success(`Welcome back, ${data.user.name}!`);
        }
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
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full bg-[#333] rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all pr-12"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
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
