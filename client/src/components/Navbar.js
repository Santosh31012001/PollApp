import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#224f3c]">PollApp</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-lg text-[#00ce78] hover:text-[#224f3c]">
                Dashboard
              </Link>
              <Link to="/create-poll">
                <button className="bg-[#00ce78] hover:bg-[#224f3c] text-white px-4 py-2 rounded-md transition-colors">
                  Create Poll
                </button>
              </Link>
              <button
                onClick={logout}
                className="text-lg  text-[#00ce78] hover:text-[#224f3c]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-lg font-semibold text-[#00ce78] hover:text-[#224f3c]">
                Login
              </Link>
              <Link to="/register">
                  <button className="bg-[#00ce78] hover:bg-[#224f3c] text-white px-4 py-2 rounded-md transition-colors">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 