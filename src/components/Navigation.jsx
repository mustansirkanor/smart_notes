import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container" style={{ justifyContent:'flex-end' }}>
        <div className="nav-menu" style={{ justifyContent:'flex-end' }}>
          <button onClick={handleLogout} className="nav-logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
