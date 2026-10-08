import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../api/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getMe().then((data) => setUser(data.user || data)).catch(() => {});
    }
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="text-3xl">✨</span> 
          <span>SmartHire</span>
        </Link>

        <div className="flex items-center gap-8">
          {!token ? (
            <>
              <Link to="/login" className="text-white hover:text-indigo-100 font-semibold transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-white text-indigo-600 px-6 py-2 rounded-full hover:shadow-lg font-bold transition-all hover:scale-105">
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* === CANDIDATE LINKS === */}
              {user?.role === 'candidate' && (
                <>
                    <Link to="/jobs" className="text-white hover:text-indigo-100 font-medium transition-colors">💼 Find Jobs</Link>
                    <Link to="/profile" className="text-white hover:text-indigo-100 font-medium transition-colors">👤 Profile</Link>
                    <Link to="/dashboard" className="text-white hover:text-indigo-100 font-medium transition-colors">📊 History</Link>
                </>
              )}

              {/* === RECRUITER LINKS === */}
              {user?.role === 'recruiter' && (
                <>
                    <Link to="/recruiter-dashboard" className="text-white bg-indigo-500 hover:bg-indigo-400 font-bold px-4 py-2 rounded-lg transition-colors">
                        🎯 Dashboard
                    </Link>
                    <Link to="/recruiter-profile" className="text-white hover:text-indigo-100 font-medium transition-colors">
                        👤 Profile
                    </Link>
                </>
              )}

              <button onClick={handleLogout} className="text-white hover:text-red-200 font-medium transition-colors">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}