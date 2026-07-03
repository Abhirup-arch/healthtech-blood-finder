import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithGoogle();
    navigate('/search');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/">BloodLink</Link>
      </div>
      <div className="navbar-actions">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 500 }}>{user.displayName || user.email}</span>
            <button className="btn-login" onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <button className="btn-login" onClick={handleLogin}>Sign In with Google</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
